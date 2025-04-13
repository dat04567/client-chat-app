"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import axios from 'axios';

export async function register(formData: FormData) {
  const name = formData.get("name") as string;
  const firstName = formData.get("firstName") as string;
  const lastName = formData.get("lastName") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const passwordConfirm = formData.get("passwordConfirm") as string;



  const nameRegex = /^[a-zA-Z0-9_-]+$/;
  if (!nameRegex.test(name)) {
    return {
      success: false,
      message: "Tên không được chứa khoảng cách hoặc các ký tự đặc biệt"
    };
  }

  // Kiểm tra dữ liệu
  if (!name || !firstName || !lastName || !email || !password || !passwordConfirm) {
    return { success: false, message: "Vui lòng điền đầy đủ thông tin" };
  }


  if (password !== passwordConfirm) {
    return { success: false, message: "Mật khẩu không khớp" };
  }

  try {
    // Sử dụng biến môi trường để lấy URL API
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";


    // Sử dụng axios để gửi request đến server
    const response = await axios.post(`${apiUrl}/auth/register`,
      {
        username: name,
        firstName,
        lastName,
        email,
        password,
      },
      {
        headers: { "Content-Type": "application/json" }
      }
    );

    const data = response.data;

    if (response.status !== 200 && response.status !== 201) {
      return { success: false, message: data.message || "Đăng ký thất bại" };
    }

    // Lưu email vào session storage hoặc cookies thay vì đưa vào URL
    cookies().set("pendingVerificationEmail", email, {
      httpOnly: true, // Không cho phép JavaScript truy cập
      secure: process.env.NODE_ENV === "production", // Chỉ HTTPS trong production
      maxAge: 60 * 30, // Thời gian sống ngắn: 30 phút
      path: "/",
    });


    return redirect("/verify-email");

  } catch (error) {

    if (error instanceof Error && error.message.includes("NEXT_REDIRECT")) {
      throw error;
    }

    if (axios.isAxiosError(error) && error.response?.data) {
      // Xử lý errors array từ response
      if (error.response.data.errors && Array.isArray(error.response.data.errors)) {
        const errorMessages = error.response.data.errors.map((err: any) => err.msg).join("\n");
        return { success: false, message: errorMessages, errors: error.response.data.errors };
      }


      return { success: false, message: error.response.data.message ||  error.response.data.error ||  "Đăng ký thất bại" };
    }
    return { success: false, message: "Lỗi kết nối đến server" };
  }
}

export async function verifyEmail(token: string, userId: string) {
  if (!token || !userId) {
    return { success: false, message: "Token hoặc userId không hợp lệ" };
  }


  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

    const response = await axios.get(`${apiUrl}/auth/verify-email?token=${token}&userId=${userId}`);

    const data = response.data;

    if (response.status !== 200) {
      throw new Error(data.message || "Xác thực email thất bại");
    }

    return data;

  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      return {
        success: false,
        message: error.response.data.message || error.response.data.error || "Xác thực email thất bại"
      };
    }
    return { success: false, message: "Lỗi kết nối đến server" };
  }
}

export async function resendVerificationEmail(email: string) {
  if (!email) {
    return { success: false, message: "UserId không hợp lệ" };
  }

  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

    const response = await axios.post(`${apiUrl}/auth/resend-verification`,
      { email },
      {
        headers: { "Content-Type": "application/json" }
      }
    );

    const data = response.data;



    if (response.status !== 200) {
      return { success: false, message: data.message || "Gửi lại email xác thực thất bại" };
    }


    return data;


  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      return { success: false, message: error.response.data.error || error.response.data.message ||  "Đăng nhập thất bại" };
    }
    return { success: false, message: "Lỗi kết nối đến server" };
  }
}

export async function login(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  // Kiểm tra dữ liệu
  if (!email || !password) {
    return { success: false, message: "Vui lòng điền đầy đủ thông tin" };
  }

  try {
    // Sử dụng biến môi trường để lấy URL API
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

    // Sử dụng axios để gửi request đến server
    const response = await axios.post(`${apiUrl}/auth/login`,
      { email, password },
      {
        headers: { "Content-Type": "application/json" }
      }
    );

    const data = response.data;

    if (response.status !== 200) {
      return { success: false, message: data.message || data.error || "Đăng nhập thất bại" };
    }


    // Lưu token vào cookies
    cookies().set("token", data.data.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 1 tuần
      path: "/",
    });

    // Chuyển hướng sau khi đăng nhập thành công
    redirect("/messages");
  } catch (error) {

    if (error instanceof Error && error.message.includes("NEXT_REDIRECT")) {
      throw error;
    }
    if (axios.isAxiosError(error) && error.response) {
      return { success: false, message: error.response.data.message || error.response.data.error || "Đăng nhập thất bại" };
    }
    return { success: false, message: "Lỗi kết nối đến server" };
  }
}

