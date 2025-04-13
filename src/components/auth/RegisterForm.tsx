'use client';

import { useState, useTransition } from 'react';
import { register } from '@/app/actions/auth'; // Bỏ comment để import server action

export default function RegisterForm() {
   const [name, setName] = useState('');
   const [firstName, setFirstName] = useState('');
   const [lastName, setLastName] = useState('');
   const [email, setEmail] = useState('');
   const [password, setPassword] = useState('');
   const [passwordConfirm, setPasswordConfirm] = useState('');
   const [agreeTerms, setAgreeTerms] = useState(false);
   const [error, setError] = useState('' as string | string[]);
   const [isPending, startTransition] = useTransition();

   const handleSubmit = async (formData: FormData) => {
      startTransition(async () => {
         try {
            // Gọi server action để đăng ký
            const result = await register(formData);

            if (!result?.success) {
               if (result?.errors && Array.isArray(result?.errors)) {
                  const errorMessages = result?.errors.map((err: any) => err.msg);
                  setError(errorMessages);
               } else {
                  setError(result?.message);
               }
            }
            
            // Nếu thành công, server action sẽ tự redirect
         } catch (err) {
            if (err instanceof Error && !err.message.includes('NEXT_REDIRECT')) {
               setError('Đã có lỗi xảy ra. Vui lòng thử lại sau.');
            }
         }
      });
   };

   return (
      <div className="card border-0">
         <div className="p-4">
            <h3>Tạo Tài Khoản</h3>
            {error && Array.isArray(error) ? (
               <div className="alert alert-danger">
                  {error.map((err, index) => (
                     <p key={index}>{err}</p>
                  ))}
               </div>
            ) : (
               error && <div className="alert alert-danger">{error}</div>
            )}

            <form action={handleSubmit}>
               <div className="row g-3 gx-4">
                  <div className="col-sm-6">
                     <div className="form-group">
                        <label className="form-label" htmlFor="firstName">
                           Họ
                        </label>
                        <div className="form-control-wrap">
                           <input
                              type="text"
                              className="form-control"
                              id="firstName"
                              name="firstName"
                              placeholder="Nhập họ"
                              value={firstName}
                              onChange={(e) => setFirstName(e.target.value)}
                              required
                           />
                        </div>
                     </div>
                  </div>
                  <div className="col-sm-6">
                     <div className="form-group">
                        <label className="form-label" htmlFor="lastName">
                           Tên
                        </label>
                        <div className="form-control-wrap">
                           <input
                              type="text"
                              className="form-control"
                              id="lastName"
                              name="lastName"
                              placeholder="Nhập tên"
                              value={lastName}
                              onChange={(e) => setLastName(e.target.value)}
                              required
                           />
                        </div>
                     </div>
                  </div>
                  <div className="col-sm-6">
                     <div className="form-group">
                        <label className="form-label" htmlFor="username">
                           Username
                        </label>
                        <div className="form-control-wrap">
                           <input
                              type="text"
                              className="form-control"
                              id="username"
                              name="name"
                              placeholder="Nhập username"
                              value={name}
                              onChange={(e) => setName(e.target.value)}
                              required
                           />
                        </div>
                     </div>
                  </div>
                  <div className="col-sm-6">
                     <div className="form-group">
                        <label className="form-label" htmlFor="email-address">
                           Email
                        </label>
                        <div className="form-control-wrap">
                           <input
                              type="email"
                              className="form-control"
                              id="email-address"
                              name="email"
                              placeholder="email@example.com"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              required
                           />
                        </div>
                     </div>
                  </div>
                  <div className="col-sm-6">
                     <div className="form-group">
                        <label className="form-label" htmlFor="password">
                           Mật Khẩu
                        </label>
                        <div className="form-control-wrap">
                           <input
                              type="password"
                              className="form-control"
                              id="password"
                              name="password"
                              placeholder="Nhập mật khẩu"
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              required
                           />
                        </div>
                     </div>
                  </div>
                  <div className="col-sm-6">
                     <div className="form-group">
                        <label className="form-label" htmlFor="repeat-password">
                           Nhập Lại Mật Khẩu
                        </label>
                        <div className="form-control-wrap">
                           <input
                              type="password"
                              className="form-control"
                              id="repeat-password"
                              name="passwordConfirm"
                              placeholder="Nhập lại mật khẩu"
                              value={passwordConfirm}
                              onChange={(e) => setPasswordConfirm(e.target.value)}
                              required
                           />
                        </div>
                     </div>
                  </div>

                  <div className="col-12">
                     <div className="form-check">
                        <input
                           className="form-check-input"
                           type="checkbox"
                           name="agreeTerms"
                           id="privacy-term-agree"
                           checked={agreeTerms}
                           onChange={(e) => setAgreeTerms(e.target.checked)}
                           required
                        />
                        <label className="form-check-label" htmlFor="privacy-term-agree">
                           Tôi đồng ý với <a href="#">chính sách bảo mật &amp; điều khoản</a>
                        </label>
                     </div>
                  </div>

                  <div className="col-12">
                     <button
                        type="submit"
                        className="btn btn-primary w-100"
                        disabled={isPending || !agreeTerms}>
                        {isPending ? 'Đang xử lý...' : 'Đăng Ký Tài Khoản'}
                     </button>
                  </div>
               </div>
            </form>
         </div>

         {/* Phần còn lại của component */}
      </div>
   );
}
