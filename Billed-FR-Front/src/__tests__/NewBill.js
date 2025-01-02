// /**
//  * @jest-environment jsdom
//  */

import { screen, fireEvent } from "@testing-library/dom";
import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";
import { ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store.js";

jest.mock("../__mocks__/store.js");

describe("I am connected as an employee", () => {
  describe("I am on NewBill Page and I submit a valid new bill", () => {
    test("Then it should call the API to create a new bill and redirect to the Bills page", async () => {
      // Set up the mock localStorage
      Object.defineProperty(window, "localStorage", { value: localStorageMock });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
          email: "test@employee.com",
        })
      );

      // Mock navigation function
      const onNavigate = jest.fn();

      // Mock store methods
      mockStore.bills = jest.fn(() => ({
        create: jest.fn(() =>
          Promise.resolve({
            fileUrl: "https://mockurl.com/file.jpg",
            key: "12345",
          })
        ),
        update: jest.fn(() =>
          Promise.resolve({
            id: "12345",
          })
        ),
      }));

      // Render the NewBill page
      const html = NewBillUI();
      document.body.innerHTML = html;
      const newBill = new NewBill({
        document,
        onNavigate,
        store: mockStore, // Inject the mocked store
        localStorage: window.localStorage,
      });

      // Fill out the form fields
      screen.getByTestId("expense-type").value = "Transports";
      screen.getByTestId("expense-name").value = "Train ticket";
      screen.getByTestId("amount").value = "50";
      screen.getByTestId("datepicker").value = "2023-12-24";
      screen.getByTestId("vat").value = "10";
      screen.getByTestId("pct").value = "20";
      screen.getByTestId("commentary").value = "Business trip";

      // Mock the file input (optional if you're testing file handling as well)
      const file = new File(["image"], "test.jpg", { type: "image/jpg" });
      const fileInput = screen.getByTestId("file");
      Object.defineProperty(fileInput, "files", { value: [file] });
      fireEvent.change(fileInput);

      // Submit the form
      const form = screen.getByTestId("form-new-bill");
      fireEvent.submit(form);

      // Wait for promises to resolve
      await new Promise(process.nextTick);

      // Ensure API calls are made
      expect(mockStore.bills).toHaveBeenCalled();

      // Verify navigation to Bills page
      expect(onNavigate).toHaveBeenCalledWith(ROUTES_PATH.Bills);
    });
  });
});