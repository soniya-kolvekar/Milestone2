"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
export default function SignUp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
const router = useRouter();
  return (
    <div className=" bg-gradient-to-b from-[#5A2A6E] to-[#B58BC6] min-h-screen">
       <h1 className="text-black text-6xl ml-50 font-bold font-[marcellus] py-16">
        Habit Consequence Simulator
      </h1>  
<div className="flex flex-row">
   <div className="  w-full  -py-20"> <h6 className="text-gray-500  ml-65  ">Enter your credentials</h6></div>
                    <div className="flex flex-col -ml-335">
                        <input className="md:w-90 w-70 h-13 bg-[#E3E8F0] text-black rounded-[5px] mt-10 px-7 "type="email"placeholder="Email*" onChange={(e) => setEmail(e.target.value)}
                        />
                         <input className="md:w-90 w-70 h-13 bg-[#E3E8F0] text-black rounded-[5px] mt-5 items-center justify-center px-7 " type="password"placeholder="Set Password"onChange={(e)=>setPassword(e.target.value)}
                       />
                          <input className="md:w-90 w-70 h-13 bg-[#E3E8F0] text-black rounded-[5px] mt-5 items-center justify-center px-7 " type="password"placeholder="Confirm Password"onChange={(e)=>setPassword(e.target.value)}
                       />
                       
                      <button className="md:w-50 w-40 h-13  bg-[#C9A3D9] rounded-[5px] mt-5 text-black hover:text-white justify-center items-center md:mx-20   hover:bg-[#5A2A6E]"onClick={async(event)=>{
                         
                       router.replace('/login') }}
                       >Sign Up
                      </button>
                       <button className="md:w-50 w-40 h-13 flex flex-col bg-[#C9A3D9] rounded-[5px] mt-5 text-black hover:text-white justify-center items-center md:mx-20   hover:bg-[#5A2A6E]"onClick={async(event)=>{
                         
                       router.replace('/') }}
                       >Back
                      </button>
                     
                      
                       
                   
                    </div>
 
                   
           </div>
           
           </div>
          
  );
}
