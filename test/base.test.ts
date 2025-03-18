import { DemoModel } from "./demo/demo";

describe('set-piece', () => {
  describe('state', () => {
    test('count-fiberic', () => {
        const model = new DemoModel({ 
            code: 'demo', 
            uuid: '', 
            path: undefined, 
            parent: undefined 
        });
        expect(model.state.foo).toBe(0);
    });
  });
});