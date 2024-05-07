"use client";

export default function ErrorPage({ error }: { error: Error }) {
  return (
    <div>
      <h1>404 - Page Not Found</h1>
      <p>{JSON.stringify(error, null, 2)}</p>
    </div>
  );
}
