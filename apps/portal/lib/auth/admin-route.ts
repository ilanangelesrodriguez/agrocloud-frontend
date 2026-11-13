import type { NextRequest } from "next/server";
import type { z } from "zod";

import { authorizedIdentity } from "./authorized-identity";

export { positiveInteger } from "./authorized-identity";

export function adminIdentity(
  request: NextRequest,
  path: string,
  schema: z.ZodType<object>,
  options: { page?: number; body?: object; method?: "PATCH" } = {},
) {
  return authorizedIdentity(
    request,
    (user) => user.rol?.codigo === "SUPERADMIN" ? path : null,
    schema,
    options,
  );
}
