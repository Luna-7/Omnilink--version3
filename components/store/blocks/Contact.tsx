export default function Contact({
  data
}: {
  data: any
}) {

  return (
    <section>
      <h2>
        Contact
      </h2>
      <p>
        {data?.email || ""}
      </p>
    </section>
  )
}
