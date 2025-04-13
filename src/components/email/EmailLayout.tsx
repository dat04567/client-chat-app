import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface EmailLayoutProps {
  children: React.ReactNode;
}

const EmailLayout: React.FC<EmailLayoutProps> = ({ children }) => {
  return (
    <div className="tyn-root">
      <div className="tyn-content tyn-auth tyn-auth-centered">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-xl-4 col-lg-5 col-md-7 col-sm-9">
              <div className="my-3 text-center">
                <a className="tyn-logo tyn-logo-sm" href="/">
                  <Image src="/miumiu2.png" width={200} height={200} alt="icon" />
                </a>
              </div>
              
              <div className="card border-0">
                <div className="p-4">
                  <h3 className="text-center">Xác Thực Email</h3>
                  {children}
                </div>
              </div>
              
              <div className="text-center mt-4">
                <p className="small">
                  <Link href="/login" className="text-primary">Quay lại trang đăng nhập</Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailLayout;