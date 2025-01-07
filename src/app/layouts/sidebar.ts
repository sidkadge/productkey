import { Component, OnInit } from "@angular/core";
import { Router, NavigationEnd } from "@angular/router";
import { Store } from "@ngrx/store";
import { TranslateService } from "@ngx-translate/core";
import { slideDownUp } from "../shared/animations";

@Component({
  selector: "sidebar",
  templateUrl: "./sidebar.html",
  animations: [slideDownUp],
})
export class SidebarComponent implements OnInit {
  active = false; // Sidebar active state
  store: any; // Store data
  user: any = null; // Variable to store user data
  activeDropdown: string[] = []; // Tracks active dropdowns
  parentDropdown: string = ""; // Tracks parent dropdown

  constructor(
    public translate: TranslateService,
    public storeData: Store<any>,
    public router: Router
  ) {
    this.initStore();
  }

  async initStore() {
    this.storeData
      .select((d) => d.index)
      .subscribe((d) => {
        this.store = d;
      });
  }

  ngOnInit(): void {
    // Set the active dropdown on initialization
    this.setActiveDropdown();
console.log("Userdata: " + localStorage.getItem("userData"));
    // Retrieve user data from localStorage
    const storedUserData = localStorage.getItem("userData");
    if (storedUserData) {
      this.user = JSON.parse(storedUserData);

      // Parse the `access_levels` property from JSON string to an array
      try {
        this.user.access_levels = this.user.access_levels;
      } catch (error) {
        console.error("Failed to parse access_levels:", error);
        this.user.access_levels = [];
      }
    }

    // Subscribe to router events for active link highlighting
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.setActiveDropdown();
      }
    });
  }

  hasAccess(level: string): boolean {
    // Checks if the user has the required access level
    return this.user?.access_levels?.includes(level);
  }

  setActiveDropdown(): void {
    // Timeout ensures DOM is ready before querying
    setTimeout(() => {
      const selector = document.querySelector(
        '.sidebar ul a[routerLink="' + window.location.pathname + '"]'
      );
      if (selector) {
        selector.classList.add("active");

        const ul: any = selector.closest("ul.sub-menu");
        if (ul) {
          const navLink: any = ul
            .closest("li.menu")
            ?.querySelector(".nav-link");
          if (navLink) {
            setTimeout(() => {
              navLink.click();
            });
          }
        }
      } else {
        console.warn("Active sidebar item not found!");
      }
    }, 0);
  }

  toggleMobileMenu(): void {
    // Toggles sidebar visibility for mobile screens
    if (window.innerWidth < 1024) {
      this.storeData.dispatch({ type: "toggleSidebar" });
    }
  }

  toggleAccordion(name: string, parent?: string): void {
    // Handles accordion-style dropdown toggling
    if (this.activeDropdown.includes(name)) {
      this.activeDropdown = this.activeDropdown.filter((d) => d !== name);
    } else {
      this.activeDropdown.push(name);
    }
  }
}
