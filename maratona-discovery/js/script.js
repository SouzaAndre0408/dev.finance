const Modal = {
  open() {
    // abrir modal e add class active
    document.querySelector('.modal-overlay').classList.add('active');
  },
  close() {
    // fechar modal e remover a classe active
    document.querySelector('.modal-overlay').classList.remove('active');
  }
}

const Storage = {
  get() {
    return JSON.parse(localStorage.getItem('dev.finances')) || []
  },
  set(transactions) {
    localStorage.setItem('dev.finances', JSON.stringify(transactions))
  },
}

const Transaction = {
  all: Storage.get(),

  add(transaction) {
    Transaction.all.push(transaction)

    App.reload()
  },
  remove(index) {
    //remove passando o index, 1 => qtd de posicao que vai remover
    Transaction.all.splice(index, 1)

    App.reload()
  },

  incomes() {
    // somas as entradas
    let income = 0;
    // pegar todas as transacoes, para cada transacao, se ela for maior que 0, somar a uma variavel
    Transaction.all.forEach(transaction => {
      if (transaction.amount > 0) {
        income += transaction.amount
      }
    })
    return income
  },
  expenses() {
    // somar as saidas
    let expense = 0;
    Transaction.all.forEach(transaction => {
      if (transaction.amount < 0) {
        expense += transaction.amount
      }
    })
    return expense
  },
  total() {
    // entradas - saidas
    return Transaction.incomes() + Transaction.expenses()
  }
}

const DOM = {
  transactionsContainer: document.querySelector('#data-table tbody'),

  addTransaction(transaction, index) {
    const tr = document.createElement('tr')
    tr.innerHTML = DOM.innerHTMLTransaction(transaction, index)
    tr.dataset.index = index


    DOM.transactionsContainer.appendChild(tr)
  },
  innerHTMLTransaction(transaction, index) {
    const CSSclass = transaction.amount > 0 ? 'income' : 'expense'
    const amount = Utils.formateCurrency(transaction.amount)

    const html = `
      <td class="description">${transaction.description}</td>
      <td class="${CSSclass}">${amount}</td>
      <td class="date">${transaction.date}</td>
      <td><img onclick='Transaction.remove(${index})' src="./assets/minus.svg" alt="Remover Transação"></td>
    `
    return html
  },
  updateBalance() {
    document.getElementById('incomeDisplay').innerHTML = Utils.formateCurrency(Transaction.incomes())
    document.getElementById('expenseDisplay').innerHTML = Utils.formateCurrency(Transaction.expenses())
    document.getElementById('totalDisplay').innerHTML = Utils.formateCurrency(Transaction.total())
  },
  clearTransactions() {
    DOM.transactionsContainer.innerHTML = ''
  }
}

const Utils = {
  formatAmount(value) {
    value = Number(value) * 100

    return value
  },

  formatDate(value) {
    const splitedDate = value.split('-')

    return `${splitedDate[2]}/${splitedDate[1]}/${splitedDate[0]}`
  },

  formateCurrency(value) {
    const signal = Number(value) < 0 ? '-' : ''

    value = String(value).replace(/\D/g, '')
    value = Number(value) / 100

    value = value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    })

    return signal + value
  },

}

const Form = {
  description: document.querySelector('input#description'),
  amount: document.querySelector('input#amount'),
  date: document.querySelector('input#date'),

  getValues() {
    return {
      description: Form.description.value,
      amount: Form.amount.value,
      date: Form.date.value,
    }
  },

  validateFields() {
    const { description, amount, date } = Form.getValues()

    if (description.trim() === '' || amount.trim() === '' || date.trim() === '') {
      throw new Error('Por favor, preencha todos os campos')
    }

  },

  formatValues() {
    let { description, amount, date } = Form.getValues()

    amount = Utils.formatAmount(amount)

    date = Utils.formatDate(date)

    return {
      description,
      amount,
      date
    }
  },

  saveTransaction(transaction) {
    Transaction.add(transaction)
  },

  clearFields() {
    Form.description.value = ''
    Form.amount.value = ''
    Form.date.value = ''
  },

  submit(event) {
    event.preventDefault()

    try {
      /*  
        - verificar se todas as informacoes foram preenchidas - ok
        - formatar os dados para salvarizar - ok
        - salvar - ok
        - apagar os dados do formulario - ok
        - fechar Modal - ok
        - atualizar aplicacao - ok
    */

      Form.validateFields()
      const transaction = Form.formatValues()
      Form.saveTransaction(transaction)
      Form.clearFields()
      Modal.close()
    } catch (error) {
      alert(error.message)
    }
  },
}

const App = {
  init() {
    Transaction.all.forEach((transaction, index) => {
      DOM.addTransaction(transaction, index)
    })

    DOM.updateBalance()
    Storage.set(Transaction.all)
  },
  reload() {
    DOM.clearTransactions()
    App.init()
  },
}

App.init()
