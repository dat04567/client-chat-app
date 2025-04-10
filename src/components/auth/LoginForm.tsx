import { FacebookIcon, GoogleIcon } from "@components/icons"



export default function LoginForm() {

  return (
    <div className="card border-0">
      <div className="p-4">
        <h3>Đăng Nhập</h3>
        <div className="row g-3">
          <div className="col-12">
            <div className="form-group">
              <label className="form-label" htmlFor="email-address">Email</label>
              <div className="form-control-wrap">
                <input type="text" className="form-control" id="email-address" placeholder="email@example.com" />
              </div>
            </div>
          </div>
          <div className="col-12">
            <div className="form-group">
              <label className="form-label d-flex" htmlFor="password">
                Mật Khẩu <a href="forgot.html" className="link link-primary ms-auto">Quên mật khẩu?</a>
              </label>
              <div className="form-control-wrap">
                <input type="password" className="form-control" id="password" placeholder="Mật khẩu" />
              </div>
            </div>
          </div>
          <div className="col-12">
            <a className="btn btn-primary w-100" href="index.html">Đăng nhập tài khoản</a>
          </div>
        </div>

      </div>
      <div className="p-4 border-top border-light">
        <h6 className="tyn-title-overline text-center pb-1">Hoặc Đăng Nhập Bằng</h6>
        <ul className="d-flex gap gap-3">
          <li className="flex-grow-1">
            <button className="btn btn-light w-100">
              <GoogleIcon />
              <span>Google</span>
            </button>
          </li>
          <li className="flex-grow-1">
            <button className="btn btn-light w-100">
              <FacebookIcon />
              <span>Facebook</span>
            </button>
          </li>
        </ul>
      </div>
    </div>
  )
}
