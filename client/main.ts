import { App } from "./app";

async function main() {
    const app = new App();
    await app.initialize();
}

main();

class Foo extends Array {

}

const a = new Foo();
a.push(1);
a.push(2);
console.log(a); 
console.log(a[0]);

