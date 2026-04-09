import app from "./src/app";
import Bun from 'bun';


const port = Bun.env.PORT || 3000;

console.log("Dev server running at port 3000")
export default {
    port,
    fetch: app.fetch,
}