export class Util<T = any> {
    private readonly $target: T;
    
    public get target() { return this.$target; }

    constructor(props: { target: T }) {
        this.$target = props.target;
    }
}