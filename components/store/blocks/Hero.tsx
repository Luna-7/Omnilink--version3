export default function Hero({
  data
}: {
  data: any
}) {

  return (
    <section>
      <h1>
        {data?.title || "Welcome"}
      </h1>
      <p>
        {data?.description || ""}
      </p>
    </section>
  )
}
