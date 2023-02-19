/**
 * @jest-environment jsdom
 */

import '@testing-library/jest-dom'
import { screen, waitFor } from "@testing-library/dom"
import userEvent from '@testing-library/user-event'
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import { ROUTES, ROUTES_PATH} from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store"
import Bills from "../containers/Bills.js";
import router from "../app/Router.js";
jest.mock("../app/Store", () => mockStore)

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = screen.getByTestId('icon-window')
      //to-do write expect expression
      expect(windowIcon.classList.contains("active-icon")).toBeTruthy();
    })

    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills });
      const dates = screen
        // .getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i)
        .getAllByTestId('bill-date')
        .map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono);
      expect(dates).toEqual(datesSorted)
    })

    test("Then button add a new bill must be diplayed", async () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByTestId("btn-new-bill"))
      const addBillsButton = screen.getByTestId("btn-new-bill");
      expect(addBillsButton).toBeTruthy();
    })
  })

  describe('When I am on Bills Page but it is loading', () => {
    test('Then, Loading page should be rendered', () => {
      document.body.innerHTML = BillsUI({ loading: true })
      expect(screen.getAllByText('Loading...')).toBeTruthy()
    })
  })

  describe('When I am on Bills page but back-end send an error message', () => {
    test('Then, Error page should be rendered', () => {
      document.body.innerHTML = BillsUI({ error: 'some error message' })
      expect(screen.getAllByText('Erreur')).toBeTruthy()
    })
  })

  describe('When I click on the icon eye', () => {
    test('Then a modal should open', () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({ type: 'Employee' }))
      
      document.body.innerHTML = BillsUI({ data: bills })
      const onNavigate = (pathname) => { document.body.innerHTML = ROUTES({ pathname }) }
      
      const store = null
      const newBills = new Bills({ document, onNavigate, store, localStorage: window.localStorage })
      
      $.fn.modal = jest.fn(); // empêche erreur jQuery
      const eye = screen.getAllByTestId("icon-eye")[0]; //on test le premier icone eye 
      const handleClickIconEye = jest.fn(() => { newBills.handleClickIconEye })
      eye.addEventListener("click", handleClickIconEye)
      userEvent.click(eye)
      expect(handleClickIconEye).toHaveBeenCalled();

      expect($.fn.modal).toHaveBeenCalled();
    })
  })

  describe('When I click on the button to create a new bill', () => {
    test('Then, it should open the NewBill page', () => {
      // défini le chemin d'accès
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }

      //affiche les données de la page
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'employee'
      }))

      const billsContainer = new Bills({
        document, onNavigate, store: null, bills:bills, localStorage: window.localStorage
      })
      document.body.innerHTML = BillsUI({ data: { bills } })

      const openNewBillPage = jest.fn(billsContainer.handleClickNewBill); // créé la fonction à tester
      const buttonNewBill = screen.getByTestId("btn-new-bill"); // récupère le bouton nouvelle note de frais

      buttonNewBill.addEventListener('click', openNewBillPage); // écoute l'évènement au clic
      userEvent.click(buttonNewBill); // simule le clic

      expect(openNewBillPage).toHaveBeenCalled(); // on s'attend à ce que la fonction ait été appellée et donc la page chargée
      expect(screen.getByTestId('form-new-bill')).toBeTruthy(); // vérifie ensuite que le formulaire soit bien présent sur la page
    })
  })
})

// test d'intégration GET
describe("Given I am a user connected as Employee", () => {
  describe("When I navigate to Bills Page", () => {
    test("Then, fetches bills from mock API GET", async () => {
      localStorage.setItem("user", JSON.stringify({ type: "Employee" }));
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByText("Mes notes de frais"))
      //les 4 notes de frais sont elles présentes ?
      const content1  = screen.getByText("encore")
      expect(content1).toBeDefined()
      const content2  = screen.getByText("test1")
      expect(content2).toBeDefined()
      const content3 = screen.getByText('test3')
      expect(content3).toBeTruthy()
      const content4 = screen.getByText('test2')
      expect(content4).toBeDefined()
      //verification par taille 
      expect(screen.getAllByTestId('icon-eye').length).toEqual(4)
      //bouton pour une nouvelle note de frais
      expect(screen.getByTestId('btn-new-bill')).toHaveTextContent("Nouvelle note de frais")
      //body avec les notes de frais et defined
      expect(screen.getByTestId("tbody")).toBeDefined()
      //body avec les 4 notes de frais
      expect(screen.getByTestId("tbody")).toHaveTextContent('encore')
      expect(screen.getByTestId("tbody")).toHaveTextContent('test1')
      expect(screen.getByTestId("tbody")).toHaveTextContent('test3')
      expect(screen.getByTestId("tbody")).toHaveTextContent('test2')
    })

    describe("When an error occurs on API", () => {
      beforeEach(() => {
        jest.spyOn(mockStore, "bills")
        Object.defineProperty(
            window,
            'localStorage',
            { value: localStorageMock }
        )
        window.localStorage.setItem('user', JSON.stringify({
          type: 'Employee'
        }))
        const root = document.createElement("div")
        root.setAttribute("id", "root")
        document.body.appendChild(root)
        router()
      })

      test("Then, fetches bills from an API and fails with 404 message error", async () => {
        mockStore.bills.mockImplementationOnce(() => {
          return {
            list: () =>  {
              return Promise.reject(new Error("Erreur 404"))
            }
          }
        })
        window.onNavigate(ROUTES_PATH.Bills)
        await new Promise(process.nextTick);
        const message = await screen.getByText(/Erreur 404/)
        expect(message).toBeTruthy()
      })

      test("Then, fetches messages from an API and fails with 500 message error", async () => {
        mockStore.bills.mockImplementationOnce(() => {
          return {
            list: () =>  {
              return Promise.reject(new Error("Erreur 500"))
            }
          }
        })
        window.onNavigate(ROUTES_PATH.Bills)
        await new Promise(process.nextTick);
        const message = await screen.getByText(/Erreur 500/)
        expect(message).toBeTruthy()
      })
    })
  })
})