import AgentChat from "@/components/agent/AgentChat";
import DemoNav from "@/components/demo/DemoNav";


export default function Page(){


return (

<div>

<DemoNav/>

<div className="p-8">


<h1>

AI Agent Commerce

</h1>


<p>
Ask AI to find products based on meaning,
not keywords.
</p>


<div className="mt-4 p-4 bg-gray-50 rounded">
  <h2 className="text-lg font-semibold mb-2">Example queries:</h2>
  <ul className="list-disc list-inside space-y-1">
    <li>Lightweight glasses for driving</li>
    <li>Eco friendly products</li>
    <li>Premium materials</li>
  </ul>
</div>


<AgentChat/>


</div>

</div>


)

}
