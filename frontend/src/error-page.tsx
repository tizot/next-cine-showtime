import { Link, useRouteError } from "react-router-dom";

type Error = { statusText?: string; message?: string; status: number };

export default function ErrorPage() {
  const error = useRouteError() as Error;
  console.error(error);

  return (
    <div
      id="error-page"
      className="container mx-auto p-2 h-screen flex flex-auto flex-col justify-center text-center"
    >
      <h1 className="text-3xl font-bold">Oops!</h1>
      <h2 className="my-4 text-2xl font-semibold">Une erreur a eu lieu...</h2>
      <p className="my-8">
        <Link to="/">Retour aux séances</Link>
      </p>
    </div>
  );
}
