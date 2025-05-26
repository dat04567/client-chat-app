'use client';
import Image from 'next/image';
import { useState, useRef, ChangeEvent, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useGetProfileQuery, useUpdateProfileMutation } from '@/redux/services/profileApi';
import { Navbar } from '@/components';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function ProfilePage() {
   const router = useRouter();

   // RTK Query hooks
   const {
      data: profileData,
      isLoading: isLoadingProfile,
      error: profileError,
   } = useGetProfileQuery();
   const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation();

   // Local state for form fields
   const [formState, setFormState] = useState({
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: '',
      country: 'Vietnam',
      bio: '',
      avatar: '/images/avatar/1.jpg',
   });

   // Local state for image uploads
   const [coverImage, setCoverImage] = useState('/images/cover/2.jpg');
   const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
   const [coverImageFile, setCoverImageFile] = useState<File | null>(null);

   const coverInputRef = useRef<HTMLInputElement>(null);
   const profileInputRef = useRef<HTMLInputElement>(null);

   // Update local form state when profile data is loaded
   useEffect(() => {
      if (profileData) {
         setFormState({
            firstName: profileData.profile.firstName || '',
            lastName: profileData.profile.lastName || '',
            email: profileData.email || '',
            phoneNumber: profileData.profile.phone || '',
            country: profileData.country || 'Vietnam',
            bio: profileData.bio || '',
            avatar: profileData.profile.avatar || '/images/avatar/1.jpg',
         });
      }

   }, [profileData]);

   // Handle input changes
   const handleInputChange = (
      e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
   ) => {
      const { name, value } = e.target;
      setFormState((prev) => ({
         ...prev,
         [name]: value,
      }));
   };

   // Handle profile image change
   const handleProfileImageChange = (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
         const imageUrl = URL.createObjectURL(file);
         // Update avatar in local state
         setFormState((prev) => ({
            ...prev,
            avatar: imageUrl,
         }));
         // Store file for upload
         setProfileImageFile(file);
      }
   };

   // Handle cover image change
   const handleCoverImageChange = (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
         const imageUrl = URL.createObjectURL(file);
         setCoverImage(imageUrl);
         setCoverImageFile(file);
      }
   };

   // Trigger file input click
   const triggerCoverImageUpload = () => {
      coverInputRef.current?.click();
   };

   const triggerProfileImageUpload = () => {
      profileInputRef.current?.click();
   };

   // Handle form submission
   const handleSubmit = async (e: FormEvent) => {
      e.preventDefault();

      try {
         // Create form data to send to server
         const formData = new FormData();

         // Add all profile fields
         formData.append('firstName', formState.firstName);
         formData.append('lastName', formState.lastName);
         formData.append('phoneNumber', formState.phoneNumber);
         formData.append('country', formState.country);
         formData.append('bio', formState.bio);

         // Add avatar file if available
         if (profileImageFile) {
            formData.append('avatar', profileImageFile);
         }

         // Send update profile request
         const result = await updateProfile(formData).unwrap();
      
         toast.success('Cập nhật hồ sơ thành công!', {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
         });
      } catch (error) {
        //  console.error('Error updating profile:', error);
          toast.error('Cập nhật hồ sơ thất bại. Vui lòng thử lại.', {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
         });
      }
   };

   // Show loading state
   if (isLoadingProfile && !profileData) {
      return (
         <div className="tyn-root">
            <div className="tyn-content">
               <div className="container">
                  <div className="text-center py-5">
                     <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      );
   }

   return (
      <div className="tyn-root">
        <ToastContainer />
         <Navbar />
         <div className="tyn-content tyn-content-page">
            <div className="tyn-main tyn-content-inner" id="tynMain">
               <div className="container">
                  <div className="tyn-profile">
                     <div className="tyn-profile-head">
                        <div className="tyn-profile-cover"></div>
       
                        <div className="tyn-profile-info">
                           <div className="tyn-media-group align-items-start">
                              <div className="tyn-media tyn-media-bordered tyn-size-4xl tyn-profile-avatar position-relative">
                  
                                 <Image
                                    src={formState.avatar || '/images/avatar/default.png'}
                                    alt="Profile Avatar"
                                    width={100}
                                    height={100}
                                    style={{
                                       width: '100%',
                                       height: '100%',
                                       objectFit: 'cover',
                                       borderRadius: '50%',
                                    }}
                                 />
                                 <button
                                    type="button"
                                    onClick={triggerProfileImageUpload}
                                    className="btn btn-sm btn-light position-absolute end-0 bottom-0 rounded-circle"
                                    style={{
                                       width: '32px',
                                       height: '32px',
                                       padding: '0',
                                       zIndex: 1,
                                    }}>
                                    <svg
                                       xmlns="http://www.w3.org/2000/svg"
                                       width="16"
                                       height="16"
                                       fill="currentColor"
                                       className="bi bi-camera"
                                       viewBox="0 0 16 16">
                                       <path d="M15 12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h1.172a3 3 0 0 0 2.12-.879l.83-.828A1 1 0 0 1 6.827 3h2.344a1 1 0 0 1 .707.293l.828.828A3 3 0 0 0 12.828 5H14a1 1 0 0 1 1 1zM2 4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-1.172a2 2 0 0 1-1.414-.586l-.828-.828A2 2 0 0 0 9.172 2H6.828a2 2 0 0 0-1.414.586l-.828.828A2 2 0 0 1 3.172 4z" />
                                       <path d="M8 11a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5m0 1a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7M3 6.5a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0" />
                                    </svg>
                                 </button>
                                 <input
                                    ref={profileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleProfileImageChange}
                                    style={{ display: 'none' }}
                                 />
                              </div>
                              <div className="tyn-media-col">
                                 <div className="tyn-media-row">
                                    <h4 className="name">
                                       {formState.firstName} {formState.lastName}{' '}
                                       <span className="username">
                                          @{profileData?.username || 'username'}
                                       </span>
                                    </h4>
                                 </div>
                                 {/* .tyn-media-row */}
                                 <div className="tyn-media-row has-dot-sap">
                                    <span className="content">{profileData?.email}</span>
                                 </div>
                                 {/* .tyn-media-row */}
                              </div>
                              {/* .tyn-media-col */}
                           </div>
                           {/* .tyn-media-group */}
                        </div>
                        {/* .tyn-profile-info */}
                     </div>
                     {/* .tyn-profile-head */}
                     <div className="tyn-profile-nav">
                        <ul className="nav nav-tabs nav-tabs-line">
                           <li className="nav-item">
                              <button
                                 className="nav-link active"
                                 data-bs-toggle="tab"
                                 data-bs-target="#profile-edit"
                                 type="button">
                                 Chỉnh sửa hồ sơ
                              </button>
                           </li>
                           {/* li */}
                        </ul>
                        {/* .nav-tabs */}
                     </div>
                     {/* .tyn-profile-nav */}
                     <div className="tyn-profile-details">
                        <div className="tab-content">
                           <div className="tab-pane show active" id="profile-edit" tabIndex={0}>
                              <div className="row gy-5">
                                 <div className="col-12">
                                    <div className="row gy-4">
                                       <div className="col-lg-3">
                                          <h6>Thông tin cá nhân</h6>
                                          <div className="tyn-subtext">
                                             Chỉnh sửa thông tin cá nhân của bạn
                                          </div>
                                       </div>
                                       {/* .col */}
                                       <div className="col-lg-9">
                                          <form onSubmit={handleSubmit}>
                                             <div className="row g-gs">
                                                <div className="col-lg-6">
                                                   <div className="form-group">
                                                      <label
                                                         className="form-label"
                                                         htmlFor="firstName">
                                                         Họ
                                                      </label>
                                                      <div className="form-control-wrap">
                                                         <input
                                                            type="text"
                                                            className="form-control"
                                                            id="firstName"
                                                            name="firstName"
                                                            placeholder="Họ của bạn"
                                                            value={formState.firstName}
                                                            onChange={handleInputChange}
                                                         />
                                                      </div>
                                                   </div>
                                                   {/* .form-group */}
                                                </div>
                                                {/* .col */}
                                                <div className="col-lg-6">
                                                   <div className="form-group">
                                                      <label
                                                         className="form-label"
                                                         htmlFor="lastName">
                                                         Tên
                                                      </label>
                                                      <div className="form-control-wrap">
                                                         <input
                                                            type="text"
                                                            className="form-control"
                                                            id="lastName"
                                                            name="lastName"
                                                            placeholder="Tên của bạn"
                                                            value={formState.lastName}
                                                            onChange={handleInputChange}
                                                         />
                                                      </div>
                                                   </div>
                                                   {/* .form-group */}
                                                </div>
                                                {/* .col */}
                                                <div className="col-12">
                                                   <div className="form-group">
                                                      <label
                                                         className="form-label d-flex"
                                                         htmlFor="email">
                                                         Email chính{' '}
                                                         <span className="small ms-2 text-success">
                                                            {profileData?.isVerified
                                                               ? 'Đã xác thực'
                                                               : 'Chưa xác thực'}
                                                         </span>
                                                      </label>
                                                      <div className="form-control-wrap">
                                                         <input
                                                            type="text"
                                                            className="form-control"
                                                            id="email"
                                                            name="email"
                                                            disabled
                                                            placeholder="Email chính"
                                                            value={formState.email}
                                                         />
                                                      </div>
                                                      <div className="tyn-subtext mt-2">
                                                         Bạn cần có ít nhất một email được liên kết
                                                         với tài khoản của mình
                                                      </div>
                                                   </div>
                                                   {/* .form-group */}
                                                </div>
                                                {/* .col */}
                                                <div className="col-lg-6">
                                                   <div className="form-group">
                                                      <label
                                                         className="form-label"
                                                         htmlFor="phoneNumber">
                                                         Số điện thoại
                                                      </label>
                                                      <div className="form-control-wrap">
                                                         <input
                                                            type="text"
                                                            className="form-control"
                                                            id="phoneNumber"
                                                            name="phoneNumber"
                                                            placeholder="Số điện thoại của bạn"
                                                            value={formState.phoneNumber}
                                                            onChange={handleInputChange}
                                                         />
                                                      </div>
                                                   </div>
                                                   {/* .form-group */}
                                                </div>
                                                {/* .col */}
                                                <div className="col-lg-6">
                                                   <div className="form-group">
                                                      <label
                                                         className="form-label"
                                                         htmlFor="country">
                                                         Quốc gia
                                                      </label>
                                                      <div className="form-control-wrap">
                                                         <select
                                                            className="form-select"
                                                            id="country"
                                                            name="country"
                                                            value={formState.country}
                                                            onChange={handleInputChange}>
                                                            <option value="Vietnam">
                                                               Việt Nam
                                                            </option>
                                                            <option value="US">Hoa Kỳ</option>
                                                            <option value="UK">Anh</option>
                                                            <option value="Canada">Canada</option>
                                                            <option value="Australia">Úc</option>
                                                            <option value="China">
                                                               Trung Quốc
                                                            </option>
                                                            <option value="Japan">Nhật Bản</option>
                                                            <option value="Korea">Hàn Quốc</option>
                                                            <option value="Singapore">
                                                               Singapore
                                                            </option>
                                                            <option value="Thailand">
                                                               Thái Lan
                                                            </option>
                                                         </select>
                                                      </div>
                                                   </div>
                                                   {/* .form-group */}
                                                </div>
                                                {/* .col */}
                                                <div className="col-12">
                                                   <div className="form-group">
                                                      <label className="form-label" htmlFor="bio">
                                                         Giới thiệu
                                                      </label>
                                                      <div className="form-control-wrap">
                                                         <textarea
                                                            className="form-control"
                                                            id="bio"
                                                            name="bio"
                                                            placeholder="Viết một vài điều về bản thân bạn"
                                                            value={formState.bio}
                                                            onChange={handleInputChange}
                                                            rows={4}></textarea>
                                                      </div>
                                                   </div>
                                                   {/* .form-group */}
                                                </div>
                                                {/* .col */}
                                                <div className="col-12">
                                                   <div className="form-group">
                                                      <button
                                                         type="submit"
                                                         className="btn btn-lg btn-primary"
                                                         disabled={isUpdating}>
                                                         {isUpdating ? (
                                                            <>
                                                               <span
                                                                  className="spinner-border spinner-border-sm me-1"
                                                                  role="status"
                                                                  aria-hidden="true"></span>
                                                               Đang cập nhật...
                                                            </>
                                                         ) : (
                                                            'Cập nhật hồ sơ'
                                                         )}
                                                      </button>
                                                   </div>
                                                   {/* .form-group */}
                                                </div>
                                                {/* .col */}
                                             </div>
                                             {/* .row */}
                                          </form>
                                       </div>
                                       {/* .col */}
                                    </div>
                                    {/* .row */}
                                 </div>
                                 {/* .col */}
                              </div>
                              {/* .row */}
                           </div>
                           {/* .tab-pane */}
                        </div>
                        {/* .tab-content */}
                     </div>
                     {/* .tyn-profile-details */}
                  </div>
                  {/* .tyn-profile */}
               </div>
               {/* .container */}
            </div>
            {/* .tyn-main */}
         </div>
      </div>
   );
}
