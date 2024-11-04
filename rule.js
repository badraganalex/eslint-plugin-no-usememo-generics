const meta = {
  type: "problem",
  docs: {
    description: "Prevent providing generics in useMemo calls.",
  },
  fixable: "code",
  hasSuggestions: true,
  messages: {
    moveGenericToReturnType:
      "Move the generic of useMemo to the return type of the factory function.",
    removeGeneric: "Remove generic from useMemo.",
  },
  schema: [],
};

function create(context) {
  return {
    // Performs action in the function on every variable declarator
    VariableDeclarator(node) {
      // Check if the node is a `const` variable declaration
      if (node.parent.kind !== "const") return;

      // Check if we're calling useMemo to initialize the variable
      if (
        node.init &&
        node.init.type === "CallExpression" &&
        node.init.callee &&
        node.init.callee.name === "useMemo"
      ) {
        // Check if we're providing a generic to useMemo
        if (
          node.init.typeArguments &&
          node.init.typeArguments.params.length > 0
        ) {
          // Check if the first argument is a function
          if (
            node.init.arguments &&
            node.init.arguments[0] &&
            ["ArrowFunctionExpression", "FunctionExpression"].includes(
              node.init.arguments[0].type,
            )
          ) {
            // If the function doesn't have a return type, move the generic from useMemo to the return type of the factory function
            if (!node.init.arguments[0].returnType) {
              const functionNode = node.init.arguments[0];

              const returnTypePosition = getReturnTypePosition(
                context.sourceCode.getText(functionNode),
              );

              context.report({
                node,
                messageId: "moveGenericToReturnType",
                fix(fixer) {
                  const fixes = [
                    // Remove the generic type from useMemo
                    fixer.remove(node.init.typeArguments),
                  ];

                  if (returnTypePosition !== -1) {
                    // Replace the generic type in the function return type
                    fixes.push(
                      fixer.insertTextAfterRange(
                        [
                          functionNode.range[0],
                          functionNode.range[0] + returnTypePosition,
                        ],
                        ": " +
                          context.sourceCode.getText(
                            node.init.typeArguments.params[0],
                          ),
                      ),
                    );
                  }

                  return fixes;
                },
              });
            } else {
              // If the factory function of useMemo already has a return type, just remove the generic from useMemo
              context.report({
                node,
                messageId: "removeGeneric",
                fix(fixer) {
                  return fixer.remove(node.init.typeArguments);
                },
              });
            }
          }
        }
      }
    },
  };
}

export default { meta, create };

/**
 * Helper function to get the position of the return type in a function string
 * @param {string} functionString
 * @returns {number} the position of the return type in the function string, or -1 if it couldn't be found
 */
const getReturnTypePosition = (functionString) => {
  // Matches the function signature (function or arrow) without any arguments since useMemo only accepts functions without arguments
  const regex = /(function)?\s*\(\s*\)/;

  const match = functionString.match(regex);

  if (match) {
    return match[0].length;
  }

  return -1;
};
