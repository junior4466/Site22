// ===================================
// 2Q CONSULTORIA - SCRIPT.JS
// ===================================

// CONFIGURAÇÕES CENTRALIZADAS
const CONFIG = {
  // Links sociais (editáveis)
  whatsappUrl:
    "https://api.whatsapp.com/send/?phone=5569999485475&text=Olá, gostaria de uma análise gratuita com a 2Q Consultoria",
  instagramUrl: "https://www.instagram.com/agencia2qmarketing",

  // URL do Google Apps Script (editável)
  formSubmitUrl: "https://script.google.com/macros/s/AKfycbwZOZYyp7IzfV2iZjJPMi1kXRp5Bj9gXuLnhHzQ1EG7/exec",
}

// ===================================
// HEADER STICKY
// ===================================
const header = document.getElementById("header")
let lastScroll = 0

window.addEventListener("scroll", () => {
  const currentScroll = window.pageYOffset

  if (currentScroll > 100) {
    header.classList.add("scrolled")
  } else {
    header.classList.remove("scrolled")
  }

  lastScroll = currentScroll
})

// ===================================
// MENU MOBILE
// ===================================
const menuToggle = document.getElementById("menu-toggle")
const nav = document.getElementById("nav")

menuToggle.addEventListener("click", () => {
  nav.classList.toggle("active")
  menuToggle.classList.toggle("active")
})

// Fechar menu ao clicar em link
const navLinks = document.querySelectorAll(".nav-list a")
navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    nav.classList.remove("active")
    menuToggle.classList.remove("active")
  })
})

// ===================================
// STICKY CTA BAR
// ===================================
const stickyCta = document.getElementById("sticky-cta")

window.addEventListener("scroll", () => {
  const formBox = document.getElementById("formulario")
  const formBoxRect = formBox.getBoundingClientRect()

  // Mostrar sticky CTA quando o formulário não está visível
  if (formBoxRect.bottom < 0 || formBoxRect.top > window.innerHeight) {
    stickyCta.classList.add("visible")
  } else {
    stickyCta.classList.remove("visible")
  }
})

// ===================================
// SCROLL SUAVE
// ===================================
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault()
    const target = document.querySelector(this.getAttribute("href"))
    if (target) {
      const offsetTop = target.offsetTop - 80
      window.scrollTo({
        top: offsetTop,
        behavior: "smooth",
      })
    }
  })
})

// ===================================
// MULTI-STEP FORM
// ===================================
const form = document.getElementById("lead-form")
const formSteps = document.querySelectorAll(".form-step")
const progressFill = document.getElementById("progress-fill")
const currentStepText = document.getElementById("current-step")
let currentStep = 1
const totalSteps = formSteps.length

// Atualizar progress bar
function updateProgress() {
  const progress = (currentStep / totalSteps) * 100
  progressFill.style.width = `${progress}%`
  currentStepText.textContent = currentStep
}

// Mostrar step específico
function showStep(stepNumber) {
  formSteps.forEach((step, index) => {
    step.classList.remove("active")
    if (index + 1 === stepNumber) {
      step.classList.add("active")
    }
  })
  currentStep = stepNumber
  updateProgress()
}

// Validar step atual
function validateCurrentStep() {
  const activeStep = document.querySelector(".form-step.active")
  const requiredInputs = activeStep.querySelectorAll("[required]")

  for (const input of requiredInputs) {
    if (input.type === "radio") {
      const radioGroup = activeStep.querySelectorAll(`[name="${input.name}"]`)
      const isChecked = Array.from(radioGroup).some((radio) => radio.checked)
      if (!isChecked) {
        showFeedback("Por favor, selecione uma opção.", "error")
        return false
      }
    } else if (input.type === "checkbox") {
      if (!input.checked) {
        showFeedback("Por favor, aceite a política de privacidade.", "error")
        return false
      }
    } else {
      if (!input.value.trim()) {
        showFeedback("Por favor, preencha todos os campos obrigatórios.", "error")
        return false
      }

      // Validar email
      if (input.type === "email") {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(input.value)) {
          showFeedback("Por favor, insira um e-mail válido.", "error")
          return false
        }
      }
    }
  }

  return true
}

// Botões "Próximo"
document.querySelectorAll(".btn-next").forEach((btn) => {
  btn.addEventListener("click", () => {
    if (validateCurrentStep() && currentStep < totalSteps) {
      showStep(currentStep + 1)
    }
  })
})

// Botões "Voltar"
document.querySelectorAll(".btn-prev").forEach((btn) => {
  btn.addEventListener("click", () => {
    if (currentStep > 1) {
      showStep(currentStep - 1)
    }
  })
})

// ===================================
// FEEDBACK VISUAL
// ===================================
const formFeedback = document.getElementById("form-feedback")

function showFeedback(message, type) {
  formFeedback.textContent = message
  formFeedback.className = `form-feedback ${type}`
  formFeedback.style.display = "block"

  // Scroll para o feedback
  formFeedback.scrollIntoView({ behavior: "smooth", block: "nearest" })

  // Ocultar após 5 segundos se for sucesso
  if (type === "success") {
    setTimeout(() => {
      formFeedback.style.display = "none"
    }, 5000)
  }
}

// ===================================
// ENVIO DO FORMULÁRIO
// ===================================
form.addEventListener("submit", async (e) => {
  e.preventDefault()

  if (!validateCurrentStep()) {
    return
  }

  // Coletar dados do formulário
  const formData = new FormData(form)
  const data = {}

  for (const [key, value] of formData.entries()) {
    // Ignorar honeypot fields
    if (key === "website" || key === "confirm_email") continue
    data[key] = value
  }

  // Combinar diagnóstico
  data.mensagem = `Desafio: ${data.desafio || "Não informado"}\nInvestimento: ${data.investimento || "Não informado"}\n\n${data.mensagem || ""}`

  // Desabilitar botão de envio
  const submitBtn = form.querySelector(".btn-submit")
  submitBtn.disabled = true
  submitBtn.textContent = "Enviando..."

  try {
    const response = await fetch(CONFIG.formSubmitUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })

    const result = await response.json()

    if (result.success) {
      showFeedback("✅ Análise solicitada com sucesso! Entraremos em contato em breve.", "success")
      form.reset()
      showStep(1)

      // Opcional: Redirecionar ou abrir WhatsApp
      setTimeout(() => {
        // window.location.href = CONFIG.whatsappUrl;
      }, 2000)
    } else {
      showFeedback("❌ Erro ao enviar. Por favor, tente novamente.", "error")
    }
  } catch (error) {
    console.error("Erro:", error)
    showFeedback("❌ Erro de conexão. Por favor, tente novamente.", "error")
  } finally {
    submitBtn.disabled = false
    submitBtn.textContent = "Solicitar Análise Gratuita"
  }
})

// ===================================
// FORMATAÇÃO TELEFONE
// ===================================
const telefoneInput = document.getElementById("telefone")
if (telefoneInput) {
  telefoneInput.addEventListener("input", (e) => {
    let value = e.target.value.replace(/\D/g, "")

    if (value.length > 11) {
      value = value.slice(0, 11)
    }

    if (value.length > 6) {
      value = value.replace(/^(\d{2})(\d{5})(\d{0,4}).*/, "($1) $2-$3")
    } else if (value.length > 2) {
      value = value.replace(/^(\d{2})(\d{0,5})/, "($1) $2")
    } else if (value.length > 0) {
      value = value.replace(/^(\d*)/, "($1")
    }

    e.target.value = value
  })
}

// ===================================
// INICIALIZAÇÃO
// ===================================
document.addEventListener("DOMContentLoaded", () => {
  updateProgress()
  console.log("2Q Consultoria - Site carregado com sucesso!")
})
