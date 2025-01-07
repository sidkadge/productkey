import { HttpClient, HttpHeaders } from "@angular/common/http"; // Import HttpClient and HttpHeaders
import { Router, NavigationEnd } from "@angular/router";
import { ApiService } from 'src/app/api.service';

// import { HttpClient } from "@angular/common/http";
import { Component, OnDestroy, OnInit } from "@angular/core";
// import { Router } from "@angular/router";
import { Store } from "@ngrx/store";
import { TranslateService } from "@ngx-translate/core";
import { AppService } from "src/app/service/app.service";
import { interval, Subscription } from "rxjs";

@Component({
  templateUrl: "./boxed-signup.html",
})
export class BoxedSignupComponent implements OnInit, OnDestroy {
  store: any;
  mobile: string = "";
  password: string = "";

  tokenCheckSubscription: Subscription | null = null; // Initialize to null

  constructor(
    private http: HttpClient,
    public translate: TranslateService,
    public storeData: Store<any>,
    public router: Router,
    private appSetting: AppService,
    private apiService: ApiService,
  ) {
    this.initStore();
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.setActiveDropdown();
      }
    });
  }

  ngOnInit() {
    // Start checking token expiration every second
    this.tokenCheckSubscription = interval(1000).subscribe(() => {
      this.checkTokenExpiration();
    });
  }

  ngOnDestroy() {
    if (this.tokenCheckSubscription) {
      this.tokenCheckSubscription.unsubscribe();
    }
  }

  async initStore() {
    this.storeData
      .select((d) => d.index)
      .subscribe((d) => {
        this.store = d;
      });
  }

  // submitLogin() {
  //   // console.log("Submit clicked!");
  //   // console.log("mobile:", this.mobile);
  //   // console.log("password:", this.password);

  //   if (!this.password || !this.mobile) {
  //     alert("Mobile number and password are required.");
  //     // console.log("Mobile number and password are required.");
  //     return;
  //   }

  //   const apiUrl = "http://localhost/OPDClinic/authenticate";
  //   const loginData = { mobile: this.mobile, password: this.password };

  //   this.http.post(apiUrl, loginData).subscribe(
  //     (response: any) => {
  //       console.log("Response:", response);
  //       if (response.status === 200) {
  //         console.log("Authentication successful");

  //         // Store token, expiration, userid, and access levels in local storage
  //         localStorage.setItem("sessionId", response.token);
  //         const expirationTime = Date.now() + 2 * 60 * 1000; // 2 minutes in milliseconds
  //         localStorage.setItem("tokenExpiration", expirationTime.toString());
  //         localStorage.setItem("userId", response.userid);
  //         localStorage.setItem(
  //           "accessLevels",
  //           JSON.stringify(response.access_levels)
  //         );

  //         // console.log("Token stored:", response.token);
  //         // console.log("Token expiration set to:", expirationTime);

  //         // Fetch additional user data using the userid
  //         this.getUserData(response.userid);

  //         // Navigate to the dashboard and set access
  //         this.router.navigate(["/Admin-Dashboard"]).then(() => {
  //           this.setActiveDropdown();
  //         });
  //       } else {
  //         // console.log("Authentication failed", response.message);
  //         alert("Authentication failed: " + response.message);
  //       }
  //     },
  //     (error) => {
  //       // console.log("Error", error);
  //       alert("Authentication failed: Invalid mobile number or password.");
  //     }
  //   );
  // }

  // Method to check access level
  
  submitLogin() {
    if (!this.password || !this.mobile) {
      alert("Mobile number and password are required.");
      return;
    }
  
    const baseUrl = this.apiService.getBaseUrl();
    const apiUrl = `${baseUrl}/authenticate`;
    // const apiUrl = "http://localhost/OPDClinic/authenticate";
    const loginData = { mobile: this.mobile, password: this.password };
  
    this.http.post(apiUrl, loginData).subscribe(
      (response: any) => {
        console.log("Response:", response);
  
        if (response.status === 200) {
          console.log("Authentication successful");
  
          // Store token, expiration, userid, and access levels in local storage
          localStorage.setItem("sessionId", response.token);
          const expirationTime = Date.now() + 2 * 60 * 1000; // 2 minutes in milliseconds
          localStorage.setItem("tokenExpiration", expirationTime.toString());
          localStorage.setItem("userId", response.userid);
          localStorage.setItem("role", response.role);
          localStorage.setItem(
            "accessLevels",
            JSON.stringify(response.access_levels)
          );
  
          // Fetch additional user data using the userid
          this.getUserData(response.userid);
  
          // Navigate to the appropriate dashboard based on the user's role
          if (response.role === "Admin" || response.role === "Employee") {
            this.router.navigate(["/Lading-Page"]).then(() => {
              this.setActiveDropdown();
            });
          } else if (response.role === "SuperAdmin") {
            this.router.navigate(["/Super-Admin"]).then(() => {
              this.setActiveDropdown();
            });
          } else {
            alert("Unknown role: Unable to determine dashboard.");
          }
        } else {
          alert("Authentication failed: " + response.message);
        }
      },
      (error) => {
        alert("Authentication failed: Invalid mobile number or password.");
      }
    );
  }
  
  hasAccess(level: string): boolean {
    const accessLevels = JSON.parse(
      localStorage.getItem("accessLevels") || "[]"
    );
    return accessLevels.includes(level);
  }

  // Method to set the active dropdown based on URL
  setActiveDropdown() {
    const selector = document.querySelector(
      '.sidebar ul a[routerLink="' + window.location.pathname + '"]'
    );
    if (selector) {
      selector.classList.add("active");
      const ul: any = selector.closest("ul.sub-menu");
      if (ul) {
        let ele: any =
          ul.closest("li.menu").querySelectorAll(".nav-link") || [];
        if (ele.length) {
          ele = ele[0];
          setTimeout(() => {
            ele.click();
          });
        }
      }
    }
  }
  // Method to fetch user data using userid
  // Method to fetch user data using userid
  getUserData(userId: string) {
    
    // const userApiUrl = `http://localhost/OPDClinic/getUserDetails/${userId}`;
    const baseUrl = this.apiService.getBaseUrl();
    const userApiUrl = `${baseUrl}/getUserDetails/${userId}`;
    // Retrieve the token from local storage
    const token = localStorage.getItem("sessionId");

    // Set the headers with the token for authorization
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    this.http.get(userApiUrl, { headers }).subscribe(
      (response: any) => {
        // console.log("User Data:", response);

        // Store the user data if fetched successfully
        if (response.status === 200 && response.user) {
          localStorage.setItem("userData", JSON.stringify(response.user));

          // Optionally, set user data in a header component
          // this.headerService.setUserData(response.user);
        } else {
          // console.log("Failed to retrieve user data", response.message);
        }
      },
      (error) => {
        // console.log("Error fetching user data", error);
      }
    );
  }

  private checkTokenExpiration() {
    const tokenExpiration = localStorage.getItem("tokenExpiration");
    if (tokenExpiration) {
      const now = Date.now();
      // console.log("Current time:", now);
      // console.log("Token expiration time:", Number(tokenExpiration));
      if (now >= Number(tokenExpiration)) {
        // console.log("Token expired. Redirecting to signup...");
        localStorage.removeItem("sessionId");
        localStorage.removeItem("tokenExpiration");
        this.router.navigate(["/auth/boxed-signup"]);
      } else {
        // console.log(
        //   "Token is still valid. Time remaining:",
        //   (Number(tokenExpiration) - now) / 1000,
        //   "seconds"
        // );
      }
    } else {
      console.log("No token expiration found.");
    }
  }

  changeLanguage(item: any) {
    this.translate.use(item.code);
    this.appSetting.toggleLanguage(item);
    if (this.store.locale?.toLowerCase() === "ae") {
      this.storeData.dispatch({ type: "toggleRTL", payload: "rtl" });
    } else {
      this.storeData.dispatch({ type: "toggleRTL", payload: "ltr" });
    }
    window.location.reload();
  }
}
