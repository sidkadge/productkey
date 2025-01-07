import {
  D as N,
  I as T,
  L as V,
  Uc as B,
  Wb as q,
  b as I,
  c as E,
  k as C,
  lf as W,
  m as D,
  n as L,
  o as M,
  of as F,
  p as A,
  q as j,
  te as U,
} from "./chunk-Y6N6SX43.js";
import {
  B as v,
  Bb as y,
  Kb as o,
  Lb as n,
  Mb as c,
  Qb as k,
  Sb as _,
  ec as d,
  hb as u,
  hc as b,
  ib as m,
  ic as f,
  jc as w,
  oa as x,
  ya as g,
  za as p,
} from "./chunk-JVOGHDQI.js";
import { g as S } from "./chunk-GAL4ENT6.js";
var $ = (() => {
  let l = class l {
    constructor(t, i, e, a, r) {
      (this.http = t),
        (this.translate = i),
        (this.storeData = e),
        (this.router = a),
        (this.appSetting = r),
        (this.mobile = ""),
        (this.password = ""),
        (this.tokenCheckSubscription = null),
        this.initStore(),
        this.router.events.subscribe((s) => {
          s instanceof T && this.setActiveDropdown();
        });
    }
    ngOnInit() {
      this.tokenCheckSubscription = v(1e3).subscribe(() => {
        this.checkTokenExpiration();
      });
    }
    ngOnDestroy() {
      this.tokenCheckSubscription && this.tokenCheckSubscription.unsubscribe();
    }
    initStore() {
      return S(this, null, function* () {
        this.storeData
          .select((t) => t.index)
          .subscribe((t) => {
            this.store = t;
          });
      });
    }
    submitLogin() {
      if (!this.password || !this.mobile) {
        alert("Mobile number and password are required.");
        return;
      }
      let t = "https://opdclinic.greatfive.in/authenticate",
        i = { mobile: this.mobile, password: this.password };
      this.http.post(t, i).subscribe(
        (e) => {
          if (e.status === 200) {
            console.log("Authentication successful"),
              localStorage.setItem("sessionId", e.token);
            let a = Date.now() + 2 * 60 * 1e3;
            localStorage.setItem("tokenExpiration", a.toString()),
              localStorage.setItem("userId", e.userid),
              localStorage.setItem(
                "accessLevels",
                JSON.stringify(e.access_levels)
              ),
              this.getUserData(e.userid),
              this.router.navigate(["/Admin-Dashboard"]).then(() => {
                this.setActiveDropdown();
              });
          } else alert("Authentication failed: " + e.message);
        },
        (e) => {
          alert("Authentication failed: Invalid mobile number or password.");
        }
      );
    }
    hasAccess(t) {
      return JSON.parse(localStorage.getItem("accessLevels") || "[]").includes(
        t
      );
    }
    setActiveDropdown() {
      let t = document.querySelector(
        '.sidebar ul a[routerLink="' + window.location.pathname + '"]'
      );
      if (t) {
        t.classList.add("active");
        let i = t.closest("ul.sub-menu");
        if (i) {
          let e = i.closest("li.menu").querySelectorAll(".nav-link") || [];
          e.length &&
            ((e = e[0]),
            setTimeout(() => {
              e.click();
            }));
        }
      }
    }
    getUserData(t) {
      let i = `https://opdclinic.greatfive.in/getUserDetails/${t}`,
        e = localStorage.getItem("sessionId"),
        a = new I({ Authorization: `Bearer ${e}` });
      this.http.get(i, { headers: a }).subscribe(
        (r) => {
          r.status === 200 &&
            r.user &&
            localStorage.setItem("userData", JSON.stringify(r.user));
        },
        (r) => {}
      );
    }
    checkTokenExpiration() {
      let t = localStorage.getItem("tokenExpiration");
      t
        ? Date.now() >= Number(t) &&
          (localStorage.removeItem("sessionId"),
          localStorage.removeItem("tokenExpiration"),
          this.router.navigate(["/auth/boxed-signup"]))
        : console.log("No token expiration found.");
    }
    changeLanguage(t) {
      this.translate.use(t.code),
        this.appSetting.toggleLanguage(t),
        this.store.locale?.toLowerCase() === "ae"
          ? this.storeData.dispatch({ type: "toggleRTL", payload: "rtl" })
          : this.storeData.dispatch({ type: "toggleRTL", payload: "ltr" }),
        window.location.reload();
    }
  };
  (l.ɵfac = function (i) {
    return new (i || l)(m(E), m(W), m(q), m(V), m(F));
  }),
    (l.ɵcmp = x({
      type: l,
      selectors: [["ng-component"]],
      decls: 36,
      vars: 3,
      consts: [
        ["signupForm", "ngForm"],
        [1, "absolute", "inset-0"],
        [
          "src",
          "/assets/images/auth/bg-gradient.png",
          "alt",
          "image",
          1,
          "h-full",
          "w-full",
          "object-cover",
        ],
        [
          1,
          "relative",
          "flex",
          "min-h-screen",
          "items-center",
          "justify-center",
          "bg-[url(/assets/images/auth/map.png)]",
          "bg-cover",
          "bg-center",
          "bg-no-repeat",
          "px-6",
          "py-10",
          "dark:bg-[#060818]",
          "sm:px-16",
        ],
        [
          "src",
          "/assets/images/auth/coming-soon-object1.png",
          "alt",
          "image",
          1,
          "absolute",
          "left-0",
          "top-1/2",
          "h-full",
          "max-h-[893px]",
          "-translate-y-1/2",
        ],
        [
          "src",
          "/assets/images/auth/coming-soon-object2.png",
          "alt",
          "image",
          1,
          "absolute",
          "left-24",
          "top-0",
          "h-40",
          "md:left-[30%]",
        ],
        [
          "src",
          "/assets/images/auth/coming-soon-object3.png",
          "alt",
          "image",
          1,
          "absolute",
          "right-0",
          "top-0",
          "h-[300px]",
        ],
        [
          "src",
          "/assets/images/auth/polygon-object.svg",
          "alt",
          "image",
          1,
          "absolute",
          "bottom-0",
          "end-[28%]",
        ],
        [
          1,
          "relative",
          "w-full",
          "max-w-[573px]",
          "rounded-md",
          "bg-[linear-gradient(45deg,#fff9f9_0%,rgba(255,255,255,0)_25%,rgba(255,255,255,0)_75%,_#fff9f9_100%)]",
          "p-2",
          "dark:bg-[linear-gradient(52.22deg,#0E1726_0%,rgba(14,23,38,0)_18.66%,rgba(14,23,38,0)_51.04%,rgba(14,23,38,0)_80.07%,#0E1726_100%)]",
        ],
        [
          1,
          "relative",
          "flex",
          "flex-col",
          "justify-center",
          "rounded-md",
          "bg-white/60",
          "px-6",
          "py-20",
          "backdrop-blur-lg",
          "dark:bg-black/50",
          "lg:min-h-[500px]",
        ],
        [1, "flex", "justify-center", "mb-6"],
        [
          "src",
          "/assets/images/FinalAayurphysioLogo4.png",
          "alt",
          "Logo",
          1,
          "h-16",
          "w-auto",
        ],
        [1, "mx-auto", "w-full", "max-w-[440px]"],
        [1, "mb-10"],
        [
          1,
          "text-3xl",
          "font-extrabold",
          "uppercase",
          "!leading-snug",
          "text-primary",
          "md:text-4xl",
        ],
        [1, "text-base", "font-bold", "leading-normal", "text-white-dark"],
        [1, "space-y-5", "dark:text-white", 3, "ngSubmit"],
        ["for", "mobile"],
        [1, "relative", "text-white-dark"],
        [
          "id",
          "mobile",
          "type",
          "text",
          "placeholder",
          "Enter mobile",
          "name",
          "mobile",
          "required",
          "",
          1,
          "form-input",
          "ps-10",
          "placeholder:text-white-dark",
          3,
          "ngModelChange",
          "ngModel",
        ],
        [1, "absolute", "start-4", "top-1/2", "-translate-y-1/2"],
        [3, "fill"],
        ["for", "password"],
        [
          "id",
          "password",
          "type",
          "password",
          "placeholder",
          "Enter password",
          "name",
          "password",
          "required",
          "",
          1,
          "form-input",
          "ps-10",
          "placeholder:text-white-dark",
          3,
          "ngModelChange",
          "ngModel",
        ],
        [
          "type",
          "submit",
          1,
          "btn",
          "btn-gradient",
          "!mt-6",
          "w-full",
          "border-0",
          "uppercase",
          "shadow-[0_10px_20px_-10px_rgba(67,97,238,0.44)]",
        ],
      ],
      template: function (i, e) {
        if (i & 1) {
          let a = k();
          o(0, "div")(1, "div", 1),
            c(2, "img", 2),
            n(),
            o(3, "div", 3),
            c(4, "img", 4)(5, "img", 5)(6, "img", 6)(7, "img", 7),
            o(8, "div", 8)(9, "div", 9)(10, "div", 10),
            c(11, "img", 11),
            n(),
            o(12, "div", 12)(13, "div", 13)(14, "h1", 14),
            d(15, " Sign In "),
            n(),
            o(16, "p", 15),
            d(17, " Enter your mobile number and password to login "),
            n()(),
            o(18, "form", 16, 0),
            _("ngSubmit", function () {
              return g(a), p(e.submitLogin());
            }),
            o(20, "div")(21, "label", 17),
            d(22, "Mobile"),
            n(),
            o(23, "div", 18)(24, "input", 19),
            w("ngModelChange", function (s) {
              return g(a), f(e.mobile, s) || (e.mobile = s), p(s);
            }),
            n(),
            o(25, "span", 20),
            c(26, "icon-user", 21),
            n()()(),
            o(27, "div")(28, "label", 22),
            d(29, "Password"),
            n(),
            o(30, "div", 18)(31, "input", 23),
            w("ngModelChange", function (s) {
              return g(a), f(e.password, s) || (e.password = s), p(s);
            }),
            n(),
            o(32, "span", 20),
            c(33, "icon-lock"),
            n()()(),
            o(34, "button", 24),
            d(35, " Sign In "),
            n()()()()()()();
        }
        i & 2 &&
          (u(24),
          b("ngModel", e.mobile),
          u(2),
          y("fill", !0),
          u(5),
          b("ngModel", e.password));
      },
      dependencies: [j, C, D, L, N, A, M, U, B],
      encapsulation: 2,
    }));
  let h = l;
  return h;
})();
export { $ as a };
