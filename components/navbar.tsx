"use client";
import React from "react";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const router = useRouter();

  return (
    <div className="w-screen flex justify-center">
      <div className="text-white relative rounded-full bg-black flex justify-between items-center m-10 mb-0 p-4 w-[75vw]">
        <div className="flex gap-24">
          <Button
            className="bg-black rounded-full hover:bg-gradient-to-br from-blue-500 to-purple-500 text-white"
            onClick={() => {
              router.push("");
            }}
          >
            Github
          </Button>
          <Button className="bg-black rounded-full hover:bg-gradient-to-br from-blue-500 to-purple-500 text-white">
            Contact
          </Button>
        </div>
        <h1 className="absolute left-1/2 -translate-x-1/2 text-2xl font-bold major-mono-display-regular">
          Assessly
        </h1>
        <div className="flex gap-24">
          <Button className="bg-black rounded-full hover:bg-gradient-to-br from-blue-500 to-purple-500 text-white">
            Guide
          </Button>
          <Button
            className="bg-black rounded-full hover:bg-gradient-to-br from-blue-500 to-purple-500 text-white"
            onClick={() =>
              router.push(
                "https://www.linkedin.com/in/siddharth-choudhary-a5a0a8229/"
              )
            }
          >
            Creator
          </Button>
        </div>
      </div>
    </div>
  );
}
