export type FieldErrors = Record<string, string[] | undefined>;

export type ActionState<T = undefined> =
    | {
          status: "idle";
          message?: undefined;
          data?: undefined;
          fieldErrors?: undefined;
      }
    | {
          status: "success";
          message?: string;
          data?: T;
          fieldErrors?: undefined;
      }
    | {
          status: "error";
          message: string;
          data?: undefined;
          fieldErrors?: FieldErrors;
      };

export const idle: ActionState<never> = { status: "idle" };

export const ok = <T = undefined>(
    message?: string,
    data?: T,
): ActionState<T> => ({ status: "success", message, data });

export const fail = (
    message: string,
    fieldErrors?: FieldErrors,
): ActionState<never> => ({ status: "error", message, fieldErrors });
