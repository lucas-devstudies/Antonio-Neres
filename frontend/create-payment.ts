import "dotenv/config";
import { auth } from "./src/lib/auth";

async function main() {
  const result = await auth.api.signUpEmail({
    body: {
        name: "Robert Marialva Cruz",
        email: "robertcruzsm@gmail.com",
        password: "12345678",
    },
  });

  console.log(result);
}

main();