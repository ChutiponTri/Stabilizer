import { createCustomer, queryCustomers } from "@/actions/user.action";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const params = url.searchParams;
    const id = String(params.get("id"));
    console.log(id, typeof id);
    const response = await queryCustomers(id);
    console.log("Return", response);
    return Response.json(response);
  } catch(error) {
    console.log(error);
    return Response.json({
      status: 500,
      message: error
    });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log(body);
    const response = await createCustomer(body.id, body.age, body.gender, body.birth, body.history, body.weight, body.height, body.bmi);
    return Response.json(response);
  } catch(error) {
    console.log(error);
    return Response.json({
      status: 500,
      message: error
    });
  }
}