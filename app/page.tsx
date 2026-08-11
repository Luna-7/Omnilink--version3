import Link from "next/link";
import DemoNav from "@/components/demo/DemoNav";


export default function Home(){

return (

<div>

<DemoNav/>

<main className="space-y-20 p-10">


<section>

<h1 className="text-5xl font-bold">

Make Commerce Understandable to AI

</h1>


<p className="mt-5 text-xl">

Omnilink transforms merchant products into
AI-readable commerce nodes.

</p>


<div className="mt-8 flex gap-4">

<Link
href="/dashboard"
className="rounded bg-black px-5 py-3 text-white"
>
Try Demo
</Link>


<Link
href="/agent/demo"
className="rounded border px-5 py-3"
>
Agent Demo
</Link>


</div>

</section>



<section>

<h2 className="text-3xl font-bold">

How It Works

</h2>


<div className="grid md:grid-cols-3 gap-6 mt-6">


<Card
title="Merchant Data"
text="Upload products and let AI understand them"
/>


<Card
title="AI Product Node"
text="Products become structured semantic objects"
/>


<Card
title="Agent Commerce"
text="AI agents discover products"
/>


</div>

</section>



<section>

<h2 className="text-3xl font-bold">

Demo Flow

</h2>


<p className="text-xl">

Upload → Understand → Publish → Discover

</p>


</section>



</main>

</div>

)

}


function Card({
title,
text
}:{
title:string;
text:string;
}){

return (

<div className="border rounded p-5">

<h3 className="font-bold">
{title}
</h3>

<p>
{text}
</p>


</div>

)

}
