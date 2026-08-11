"use client";

import { useState } from "react";
import AgentResult from "./AgentResult";


export default function AgentChat(){

const [query,setQuery]=useState("");

const [result,setResult]=useState<any>(null);

const [loading,setLoading]=useState(false);


async function search(){

setLoading(true);

const res=await fetch(
"/api/agent/products/query",
{
method:"POST",
headers:{
"Content-Type":"application/json"
},
body:JSON.stringify({
query
})
}
);


const data=await res.json();

setResult(data);

setLoading(false);

}



return (

<div className="space-y-4">

<div className="flex gap-2">

<input

value={query}

onChange={(e)=>setQuery(e.target.value)}

placeholder="Find products..."

className="border p-2 rounded flex-1"

/>

<button
onClick={search}
disabled={loading}
className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
>

{
loading?
"Searching..."
:
"Search"
}


</button>

</div>


{
result &&
<AgentResult data={result}/>
}


</div>


)

}
