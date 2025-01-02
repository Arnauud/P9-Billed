/**
 * @jest-environment jsdom
 */

import { screen, waitFor, fireEvent } from "@testing-library/dom";
import BillsUI from "../views/BillsUI.js";
import { bills } from "../fixtures/bills.js";
import { ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store";

import router from "../app/Router.js";

jest.mock("../app/Store", () => mockStore); // Used in Dashboard.js line 16

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {
      Object.defineProperty(window, "localStorage", { value: localStorageMock });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.Bills);
      await waitFor(() => screen.getByTestId("icon-window"));
      const windowIcon = screen.getByTestId("icon-window");

      //to-do write expect expression
      expect(windowIcon).not.toBeFalsy();
    });

    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills });
      const dates = screen
        .getAllByText(
          /^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i
        )
        .map((a) => a.innerHTML);
      const antiChrono = (a, b) => (new Date(b) - new Date(a)); // Ensure date comparison
      const datesSorted = [...dates].sort(antiChrono);
      console.log("Dates sorted", datesSorted); 
      console.log("Dates ", dates); 
      expect(dates).toEqual(datesSorted);
    });


// [Ajout de tests unitaires et d'intégration]

    test("Clicking on the eye icon displays the modal", async () => {
      // Mock user authentication
      localStorage.setItem(
        "user",
        JSON.stringify({ type: "Employee", email: "e@e" })
      );
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);

      // Initialize router and navigate to Bills page
      router();
      window.onNavigate(ROUTES_PATH.Bills);

      // Wait for the page to load
      await waitFor(() => screen.getByText("Mes notes de frais"));
      expect(screen.getByText("Mes notes de frais")).toBeTruthy();
      
    // Mock jQuery modal function
      $.fn.modal = jest.fn();

      // Simulate the display of bills
      const iconEyes = await screen.getAllByTestId("icon-eye");
      expect(iconEyes.length).toBeGreaterThan(0); // Ensure that there are eye icons

      // Click on the first eye icon
      fireEvent.click(iconEyes[0]);
      expect($.fn.modal).toHaveBeenCalledWith("show"); // Modal is shown
    });
    test("Clicking on 'Nouvelle note de frais' button should navigate to the NewBill page", () => {
      // Mock user authentication
      localStorage.setItem(
        "user",
        JSON.stringify({ type: "Employee", email: "e@e" })
      );
    
      // Set up the DOM and router
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router(); // This should initialize the app and set up routes
    
      // Set initial route to Bills page
      window.onNavigate(ROUTES_PATH['Bills']);
      
      // Get the button element by its test ID
      const newBillButton = screen.getByTestId('btn-new-bill');
    
      // Simulate a click event on the button
      fireEvent.click(newBillButton);
    
      // Check that the window hash has changed to the correct route
      expect(window.location.hash).toBe(ROUTES_PATH['NewBill']);
    });
  });
});



// [Ajout de tests unitaires et d'intégration] - GET Bills
describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("fetches bills from mock API GET", async () => {
      localStorage.setItem("user", JSON.stringify({ type: "Employee", email: "e@e" }));
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.Bills);
      await waitFor(() => screen.getByText("Mes notes de frais")); 
  });

  describe("When an error occurs on API", () => {
    beforeEach(() => {
      jest.spyOn(mockStore, "bills");
      Object.defineProperty(window, "localStorage", { value: localStorageMock });
      window.localStorage.setItem("user", JSON.stringify({ type: "Employee", email: "e@e" }));
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.appendChild(root);
      router();
    });

    test("fetches bills from an API and fails with 404 message error", async () => {
      mockStore.bills.mockImplementationOnce(() => {
        return { list: () => { return Promise.reject(new Error("Erreur 404")); }};
      });

      window.onNavigate(ROUTES_PATH.Bills); // replaced Dashboard with Bills.
      await new Promise(process.nextTick);
      const message = await screen.getByText(/Erreur 404/);
      expect(message).toBeTruthy();
    });
    
    test("fetches messages from an API and fails with 500 message error", async () => {
      mockStore.bills.mockImplementationOnce(() => {
        return { list: () => { return Promise.reject(new Error("Erreur 500")); }};
      });

      window.onNavigate(ROUTES_PATH.Bills); // replaced Dashboard with Bills.
      await new Promise(process.nextTick);
      const message = await screen.getByText(/Erreur 500/);
      expect(message).toBeTruthy();
    });
  });
});

});