import { NextResponse } from "next/server";
import { hash } from "bcrypt";

export async function POST(request: Request) {
  console.log(request.body)
  const { email, username, password } = await request.json();

  const hashedPassword = await hash(password, 10);
  console.log(JSON.stringify({
        user: {
          email: email,
          username: username,
          password: password,
          first_name: '',
          last_name: ''   
        }
      }))
  try {
    const response = await fetch(`${process.env.BACKEND_URL}/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user: {
          email: email,
          username: username,
          password: password,
          first_name: '',
          last_name: ''   
        }
      })
    })

    const data = await response.json();

    if (response.ok && data.status?.code === 200 && data.data) {
      return NextResponse.json({ 
        message: "User registered successfully",
        user: data.data 
      }, { status: 201 });
    }
    
    console.error("Registration failed:", data);
    return NextResponse.json({ 
      error: data.status?.message || "Registration failed" 
    }, { status: 400 });
  } catch (error) {
    console.error("Error during registration:", error);
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }

}