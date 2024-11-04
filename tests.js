import { RuleTester } from "@typescript-eslint/rule-tester";
import rule from "./rule.js";
import * as test from "node:test";

RuleTester.afterAll = test.after;
RuleTester.describe = test.describe;
RuleTester.it = test.it;
RuleTester.itOnly = test.it.only;

const ruleTester = new RuleTester();

// TODO: add more tests
ruleTester.run("no-usememo-generics", rule, {
  valid: [
    /**
     * Arrow functions
     */
    "const test = useMemo(() => true, []);",
    "const test = useMemo((): boolean => true, []);",

    /**
     * Regular functions
     */
    "const test = useMemo(function() { return true; }, []);",
    "const test = useMemo(function(): boolean { return true; }, []);",
  ],
  invalid: [
    /**
     * Arrow functions
     */

    // With generic and no return type
    {
      code: "const test = useMemo<boolean>(() => true, []);",
      errors: [{ messageId: "moveGenericToReturnType" }],
      output: "const test = useMemo((): boolean => true, []);",
    },

    // With generic and the same return type
    {
      code: "const test = useMemo<boolean>((): boolean => true, []);",
      errors: [{ messageId: "removeGeneric" }],
      output: "const test = useMemo((): boolean => true, []);",
    },

    /**
     * Regular functions
     */

    // With generic and no return type
    {
      code: "const test = useMemo<boolean>(function() { return true; }, []);",
      errors: [{ messageId: "moveGenericToReturnType" }],
      output: "const test = useMemo(function(): boolean { return true; }, []);",
    },

    // With generic and the same return type
    {
      code: "const test = useMemo<boolean>(function(): boolean { return true; }, []);",
      errors: [{ messageId: "removeGeneric" }],
      output: "const test = useMemo(function(): boolean { return true; }, []);",
    },
  ],
});
