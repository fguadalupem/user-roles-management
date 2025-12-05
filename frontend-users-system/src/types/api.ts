export interface LoginResponse {
  access_token: string;     // <-- EXACTO como lo devuelve NestJS
  user: {
    id: string;
    email: string;
    username: string;
    roles: string[];
    permissions: string[];
  };
}
