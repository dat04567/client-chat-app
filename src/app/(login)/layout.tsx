'use client';
import LoginForm from '@/components/auth/LoginForm';
import Image from 'next/image';
import Link from 'next/link';


export default function RootLayout({ children }) {
   return (
      <div className="tyn-root">
         <div className="tyn-content tyn-auth tyn-auth-centered">
            <div className="container">
               <div className="row justify-content-center">
                  <div className="col-xl-4 col-lg-5 col-md-7 col-sm-9">
                     <div className="my-3 text-center">
                        <a className="tyn-logo tyn-logo-sm" href="index.html">
                           <Image src="/miumiu2.png" width={200} height={200} alt="icon" />
                        </a>
                     </div>
                     {children}
                     <div className="text-center mt-4">
                        <p className="small"> 
                           Bạn chưa có tài khoản? 
                           <Link href="/register" > Đăng ký ngay</Link>
                        </p>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </div>
   );
}
