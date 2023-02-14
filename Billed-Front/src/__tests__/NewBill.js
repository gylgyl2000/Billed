/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom'
import { fireEvent, screen, waitFor } from "@testing-library/dom"
import userEvent from '@testing-library/user-event';
import NewBillUI from "../views/NewBillUI.js";
import { ROUTES, ROUTES_PATH} from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store";
import NewBill from "../containers/NewBill.js"
import router from "../app/Router.js";


describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {

    test('Then it should display NewBill page', () => {
      document.body.innerHTML = NewBillUI()
      expect(screen.getAllByText("Envoyer une note de frais")).toBeTruthy()
    })

    test("Then mail icon in vertical layout should be highlighted", async () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.NewBill)
      await waitFor(() => screen.getByTestId('icon-mail'))
      const mailIcon = screen.getByTestId('icon-mail')
      //to-do write expect expression
      expect(mailIcon.classList.contains("active-icon")).toBeTruthy();
    })

    test('Then the form should be displayed', () => {
      const html = NewBillUI()
      document.body.innerHTML = html
      expect(screen.getByTestId('form-new-bill')).toBeTruthy()
      expect(screen.getByTestId('expense-type')).toBeTruthy()
      expect(screen.getByTestId('expense-name')).toBeTruthy()
      expect(screen.getByTestId('datepicker')).toBeTruthy()
      expect(screen.getByTestId('amount')).toBeTruthy()
      expect(screen.getByTestId('vat')).toBeTruthy()
      expect(screen.getByTestId('pct')).toBeTruthy()
      expect(screen.getByTestId('commentary')).toBeTruthy()
      expect(screen.getByTestId('file')).toBeTruthy()
      expect(screen.getByRole('button')).toBeTruthy()
    })
  })

  describe("When I click on the button to upload a valid file", () => {
    test("Then it should accept the file", async () => {
      jest.clearAllMocks()
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({ type: 'Employee' }))
      
      document.body.innerHTML = NewBillUI()

      const onNavigate = (pathname) => { document.body.innerHTML = ROUTES({ pathname }) }
      
      const newBill = new NewBill({ document, onNavigate, store: mockStore, localStorage: window.localStorage })
      
      const fileInput = screen.getByTestId("file")
      const file = new File(["tested file"], "validFile.png", { type: "image/png" })

      const spyCreate = jest.spyOn(mockStore.bills(), 'create')

      const handleChangeFile = jest.fn(newBill.handleChangeFile)
      // fileInput.addEventListener("change", handleChangeFile )
      fileInput.addEventListener("change", (e) => handleChangeFile(e))
      
      userEvent.upload(fileInput, file)
      await new Promise(process.nextTick);
      
      expect(spyCreate).toHaveBeenCalled()
      // expect(handleChangeFile).toHaveBeenCalled()

      
      expect(fileInput.files[0]).toStrictEqual(file)
      // expect(colHalf).not.toContainElement(msgError)
      // expect(msgError).not.toContainHTML('<div class="error-msg" data-testid="error-msg">Veuillez sélectionner une image de type *.jpg, *.jpeg ou *.png</div>')
    })
  })

  describe("When I click on the button to upload a invalid file", () => {
    test("Then it should return a message", () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({ type: 'Employee' }))
      
      document.body.innerHTML = NewBillUI()
      const onNavigate = (pathname) => { document.body.innerHTML = ROUTES({ pathname }) }
      
      const newBill = new NewBill({ document, onNavigate, store: mockStore, localStorage: window.localStorage })
      const fileInput = screen.getByTestId("file")
      const handleChangeFile = jest.fn(newBill.handleChangeFile)
      fileInput.addEventListener("change", (e) => handleChangeFile(e))
      const file = new File(["tested file"], "validFile.pdf", { type: "application/pdf" })
      userEvent.upload(fileInput, file)
      expect(handleChangeFile).toHaveBeenCalled()
      
      const msgError = screen.getByTestId("error-msg")
      expect(msgError).toBeVisible()
      expect(fileInput.value).toBe("")
      // expect(msgError.classList.contains('visible')).toBeTruthy()
    })
  })

  describe("When I click on the submit button", () => {
    test("Then it should submit the bill form", () => {
      document.body.innerHTML = NewBillUI() 
      const onNavigate = (pathname) => {  document.body.innerHTML = ROUTES({ pathname })}
      const newBill = new NewBill({ document, onNavigate, store: mockStore, localStorage: window.localStorage })
      const mockedBill = {
        type: "Transports",
        name: "Vol Paris Reunion",
        date: "2022-10-10",
        amount: 10,
        vat: 50,
        pct: 10,
        commentary: "Test",
        fileUrl: "../img/validFile.png",
        fileName: "validFile.png",
        status: "pending",
      }
      screen.getByTestId("expense-type").value = mockedBill.type
      screen.getByTestId("expense-name").value = mockedBill.name
      screen.getByTestId("datepicker").value = mockedBill.date
      screen.getByTestId("amount").value = mockedBill.amount
      screen.getByTestId("vat").value = mockedBill.vat
      screen.getByTestId("pct").value = mockedBill.pct
      screen.getByTestId("commentary").value = mockedBill.commentary
      newBill.fileName = mockedBill.fileName
      newBill.fileUrl = mockedBill.fileUrl
      /* appel de fonction et événement*/
      newBill.updateBill = jest.fn()
      const handleSubmit = jest.fn((e) => newBill.handleSubmit(e))
      const form = screen.getByTestId("form-new-bill")
      const submitButton = screen.getByTestId('btn-send-bill')
      form.addEventListener("submit", handleSubmit)
      userEvent.click(submitButton)
      /* Vérification appel de fonction  handleSubmit */
      expect(handleSubmit).toHaveBeenCalled()
      /* Vérification appel de la méthode updateBill  */
      expect(newBill.updateBill).toHaveBeenCalled()
      /* Vérification redirectionné à la page Mes notes de frais après le clic du bouton envoyé  */
      expect(screen.getByText('Mes notes de frais')).toBeTruthy()
    })
  })
// })

//Test d'intégration POST
// describe('Given I am a user connected as Employee', () => {
  describe('When I submit a completed form', () => {
    test('Then a new bill should be created', async () => {
      const html = NewBillUI()
      document.body.innerHTML = html

      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem(
        'user',
        JSON.stringify({
          type: 'Employee',
          email: 'azerty@email.com',
        })
      )

      const newBill = new NewBill({
        document,
        onNavigate,
        store: mockStore,
        localStorage: window.localStorage,
      })
      // créé les données d'une note de frais à tester
      const sampleBill = {
        type: 'Hôtel et logement',
        name: 'encore',
        date: '2004-04-04',
        amount: 400,
        vat: 80,
        pct: 20,
        commentary: 'séminaire billed',
        fileUrl:
          'https://test.storage.tld/v0/b/billable-677b6.a…f-1.jpg?alt=media&token=c1640e12-a24b-4b11-ae52-529112e9602a',
        fileName: 'preview-facture-free-201801-pdf-1.jpg',
        status: 'pending',
      }

      // charge les données dans les champs correspondants
      screen.getByTestId('expense-type').value = sampleBill.type
      screen.getByTestId('expense-name').value = sampleBill.name
      screen.getByTestId('datepicker').value = sampleBill.date
      screen.getByTestId('amount').value = sampleBill.amount
      screen.getByTestId('vat').value = sampleBill.vat
      screen.getByTestId('pct').value = sampleBill.pct
      screen.getByTestId('commentary').value = sampleBill.commentary

      newBill.fileName = sampleBill.fileName
      newBill.fileUrl = sampleBill.fileUrl
// TODO remplacer la fonction update avec un spyOn
      newBill.updateBill = jest.fn() // crée fonction d'update
      const handleSubmit = jest.fn((e) => newBill.handleSubmit(e)) // crée fonction de submit

      const form = screen.getByTestId('form-new-bill') // récupère le formulaire
      form.addEventListener('submit', handleSubmit) // écoute la fonction au submit
      fireEvent.submit(form) // lance l'évènement submit

      expect(handleSubmit).toHaveBeenCalled() // on s'attend à ce que la fonction submit ait été appellée
      expect(newBill.updateBill).toHaveBeenCalled() // on s'attend à ce que la fonction d'update ait été appellée
      
    })
    // test erreur API
    test('fetches error from an API and fails with 500 error', async () => {
      jest.spyOn(mockStore, 'bills')
      jest.spyOn(console, 'error').mockImplementation(() => {}) // empêche console.error jest error
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      Object.defineProperty(window, 'location', {
        value: { hash: ROUTES_PATH['NewBill'] },
      })

      window.localStorage.setItem('user', JSON.stringify({ type: 'Employee' }))
      document.body.innerHTML = `<div id="root"></div>`
      router()

      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }

      mockStore.bills.mockImplementationOnce(() => {
        return {
          update: () => {
            return Promise.reject(new Error('Erreur 500'))
          },
        }
      })
      const newBill = new NewBill({
        document,
        onNavigate,
        store: mockStore,
        localStorage: window.localStorage,
      })

      // Submit form
      const form = screen.getByTestId('form-new-bill')
      const handleSubmit = jest.fn((e) => newBill.handleSubmit(e))
      form.addEventListener('submit', handleSubmit)
      fireEvent.submit(form)
      await new Promise(process.nextTick)
      expect(console.error).toBeCalled() // s'attend à ce qu'une erreur soit appellée dans la console
    })
  })
})

