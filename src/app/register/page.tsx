'use client';
import { RegisterForm } from '@/components';
import Image from 'next/image';
import Link from 'next/link';



export default function RegisterPage() {
  return (
    <div className="tyn-root">
      <div className="tyn-content tyn-auth tyn-auth-centered">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-xl-6 col-lg-8">
              <div className="mb-3 text-center">
                <Link className="tyn-logo tyn-logo-sm" href="/">
                  <Image src="/miumiu2.png" width={200} height={200} alt="icon" />
                </Link>
              </div>
              <RegisterForm />
              <div className="text-center mt-4">
                <p className="small">
                  Bạn đã có tài khoản?
                  <Link href="/login" className="link link-primary"> Đăng nhập ngay</Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
