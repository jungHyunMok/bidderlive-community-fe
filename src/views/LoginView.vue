<template>
  <section class="login-page">
    <div class="auth-card">
      <div class="auth-logo">
        <span>BidderLive</span>
        <span style="opacity: 0.7">Community</span>
      </div>
      <h1>비더라이브 커뮤니티 입장</h1>
      <p class="subtitle">같은 주소로 <strong>사용자</strong>와 <strong>운영자</strong> 모두 접속합니다. 접속 유형을 선택한 뒤 로그인하세요.</p>

      <form @submit.prevent="onSubmit" class="login-form">
        <label>
          <span class="label-text">접속 유형</span>
          <div class="role-row">
            <label class="role-option">
              <input v-model="form.entryType" type="radio" value="user" />
              <span>일반 사용자 (컬렉터/딜러)</span>
            </label>
            <label class="role-option">
              <input v-model="form.entryType" type="radio" value="admin" />
              <span>운영자 (관리자/스태프)</span>
            </label>
          </div>
        </label>

        <label>
          <span class="label-text">이메일</span>
          <input v-model="form.email" type="email" placeholder="you@example.com" required />
        </label>

        <label>
          <span class="label-text">비밀번호</span>
          <input v-model="form.password" type="password" placeholder="비밀번호" required />
        </label>

        <div v-if="errorMsg" class="error-msg">{{ errorMsg }}</div>

        <button type="submit" class="primary-btn full-width" :disabled="loading">
          <span v-if="loading">로그인 중...</span>
          <span v-else>{{ form.entryType === 'admin' ? '관리자 페이지 입장' : '커뮤니티 입장' }}</span>
        </button>
      </form>

      <div class="auth-divider">
        <span>또는</span>
      </div>

      <button class="secondary-btn full-width" @click="showRegister = !showRegister">
        {{ showRegister ? '로그인으로 돌아가기' : '회원가입' }}
      </button>

      <form v-if="showRegister" @submit.prevent="onRegister" class="login-form register-form">
        <h2>회원가입</h2>

        <label>
          <span class="label-text">이메일</span>
          <input v-model="regForm.email" type="email" placeholder="you@example.com" required />
        </label>

        <label>
          <span class="label-text">비밀번호 (8자 이상)</span>
          <input v-model="regForm.password" type="password" placeholder="비밀번호" required minlength="8" />
        </label>

        <label>
          <span class="label-text">닉네임 (2~50자)</span>
          <input v-model="regForm.nickname" type="text" placeholder="닉네임" required minlength="2" maxlength="50" />
        </label>

        <label>
          <span class="label-text">가입 유형</span>
          <div class="role-row">
            <label class="role-option">
              <input v-model="regForm.entryType" type="radio" value="BUYER" />
              <span>구매자(컬렉터)</span>
            </label>
            <label class="role-option">
              <input v-model="regForm.entryType" type="radio" value="SELLER" />
              <span>판매자(딜러)</span>
            </label>
          </div>
        </label>

        <template v-if="regForm.entryType === 'SELLER'">
          <label>
            <span class="label-text">업체명</span>
            <input v-model="regForm.companyName" type="text" placeholder="업체명" />
          </label>
          <label>
            <span class="label-text">사업자번호</span>
            <input v-model="regForm.businessNumber" type="text" placeholder="사업자번호" />
          </label>
        </template>

        <label>
          <span class="label-text">연락처</span>
          <input v-model="regForm.phone" type="text" placeholder="010-0000-0000" />
        </label>

        <div v-if="regErrorMsg" class="error-msg">{{ regErrorMsg }}</div>
        <div v-if="regSuccessMsg" class="success-msg">{{ regSuccessMsg }}</div>

        <button type="submit" class="primary-btn full-width" :disabled="regLoading">
          <span v-if="regLoading">가입 중...</span>
          <span v-else>회원가입</span>
        </button>
      </form>

      <div class="auth-footer">
        <span>일반 사용자는 피드·자랑글을, 운영자는 게시글/신고/유저 관리를 이용할 수 있습니다.</span>
      </div>
    </div>
  </section>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const loading = ref(false)
const errorMsg = ref('')
const showRegister = ref(false)
const regLoading = ref(false)
const regErrorMsg = ref('')
const regSuccessMsg = ref('')

const form = reactive({
  entryType: 'user',
  email: '',
  password: '',
})

const regForm = reactive({
  email: '',
  password: '',
  nickname: '',
  entryType: 'BUYER',
  companyName: '',
  businessNumber: '',
  phone: '',
})

async function onSubmit() {
  errorMsg.value = ''
  loading.value = true

  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: form.email,
        password: form.password,
      }),
    })

    const data = await res.json()

    if (!res.ok || !data.success) {
      errorMsg.value = data.message || '로그인에 실패했습니다.'
      return
    }

    const tokenData = data.data
    const user = tokenData.user

    const routeRole = (user.role === 'ADMIN' || user.role === 'STAFF') ? 'admin' : 'user'

    if (form.entryType === 'admin' && routeRole !== 'admin') {
      errorMsg.value = '관리자 권한이 없는 계정입니다.'
      return
    }

    const authPayload = {
      accessToken: tokenData.accessToken,
      refreshToken: tokenData.refreshToken,
      tokenType: tokenData.tokenType || 'Bearer',
      id: user.id,
      uid: user.uid,
      email: user.email,
      nickname: user.nickname,
      profileImage: user.profileImage,
      role: user.role,
      entryType: user.entryType,
      companyName: user.companyName,
      routeRole: routeRole,
    }

    sessionStorage.setItem('bidderlive-auth', JSON.stringify(authPayload))

    if (routeRole === 'admin') {
      router.push('/admin')
    } else {
      router.push('/user')
    }
  } catch (e) {
    errorMsg.value = '서버에 연결할 수 없습니다. 백엔드 서버를 확인해주세요.'
  } finally {
    loading.value = false
  }
}

async function onRegister() {
  regErrorMsg.value = ''
  regSuccessMsg.value = ''
  regLoading.value = true

  try {
    const body = {
      email: regForm.email,
      password: regForm.password,
      nickname: regForm.nickname,
      entryType: regForm.entryType,
    }
    if (regForm.entryType === 'SELLER') {
      body.companyName = regForm.companyName
      body.businessNumber = regForm.businessNumber
    }
    if (regForm.phone) {
      body.phone = regForm.phone
    }

    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    const data = await res.json()

    if (!res.ok || !data.success) {
      regErrorMsg.value = data.message || '회원가입에 실패했습니다.'
      return
    }

    regSuccessMsg.value = '회원가입이 완료되었습니다! 로그인해주세요.'
    showRegister.value = false

    form.email = regForm.email
    form.password = regForm.password
  } catch (e) {
    regErrorMsg.value = '서버에 연결할 수 없습니다.'
  } finally {
    regLoading.value = false
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: radial-gradient(circle at top, #111827 0%, #020308 55%);
  color: #f9fafb;
}

.auth-card {
  width: 100%;
  max-width: 420px;
  background: radial-gradient(circle at top left, #1f2937, #020308 65%);
  border-radius: 24px;
  border: 1px solid rgba(148, 163, 184, 0.35);
  padding: 32px 28px 28px;
  box-shadow: 0 18px 35px rgba(0, 0, 0, 0.65);
}

.auth-logo {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  padding: 4px 10px;
  border-radius: 999px;
  background: rgba(15, 23, 42, 0.8);
  border: 1px solid rgba(148, 163, 184, 0.4);
  margin-bottom: 10px;
}

.auth-card h1 {
  margin: 0 0 4px;
  font-size: 24px;
  letter-spacing: 0.04em;
}

.subtitle {
  margin: 4px 0 24px;
  font-size: 13px;
  color: #9ca3af;
}

.label-text {
  display: block;
  margin-bottom: 6px;
  font-size: 13px;
  color: #9ca3af;
}

.role-row {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-top: 6px;
}

.role-option {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 7px 10px;
  border-radius: 999px;
  border: 1px solid rgba(55, 65, 81, 0.8);
  background: rgba(15, 23, 42, 0.8);
  cursor: pointer;
  margin: 0;
  font-size: 13px;
  color: #9ca3af;
}

.role-option input {
  accent-color: #ff3b69;
}

.login-form label {
  display: block;
  margin-bottom: 14px;
}

.login-form label:has(.role-row) {
  margin-bottom: 10px;
}

.login-form input[type='email'],
.login-form input[type='password'],
.login-form input[type='text'] {
  width: 100%;
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid rgba(55, 65, 81, 0.9);
  background: rgba(15, 23, 42, 0.95);
  color: #f9fafb;
  font-size: 14px;
  outline: none;
}

.login-form input:focus {
  border-color: #ff3b69;
  box-shadow: 0 0 0 1px rgba(255, 59, 105, 0.4);
}

fieldset {
  border: none;
  padding: 0;
  margin: 0 0 14px;
}

fieldset legend {
  font-size: 13px;
  color: #9ca3af;
  margin-bottom: 4px;
}

.primary-btn {
  border-radius: 999px;
  border: none;
  cursor: pointer;
  font-size: 14px;
  padding: 9px 16px;
  font-weight: 500;
  background: linear-gradient(135deg, #ff3b69, #ff4f7a);
  color: #0b0b10;
  box-shadow: 0 12px 25px rgba(255, 59, 105, 0.35);
  transition: transform 0.18s ease, box-shadow 0.18s ease;
}

.primary-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 16px 32px rgba(255, 59, 105, 0.45);
}

.primary-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.primary-btn.full-width {
  width: 100%;
  margin-top: 8px;
}

.secondary-btn {
  border-radius: 999px;
  border: 1px solid rgba(148, 163, 184, 0.4);
  cursor: pointer;
  font-size: 14px;
  padding: 9px 16px;
  font-weight: 500;
  background: transparent;
  color: #9ca3af;
  transition: background 0.18s ease;
}

.secondary-btn:hover {
  background: rgba(148, 163, 184, 0.1);
}

.secondary-btn.full-width {
  width: 100%;
}

.auth-divider {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 16px 0;
  color: #6b7280;
  font-size: 12px;
}

.auth-divider::before,
.auth-divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: rgba(107, 114, 128, 0.3);
}

.register-form {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid rgba(107, 114, 128, 0.2);
}

.register-form h2 {
  font-size: 18px;
  margin: 0 0 16px;
}

.error-msg {
  color: #ff3b69;
  font-size: 13px;
  margin-bottom: 8px;
  padding: 8px 12px;
  background: rgba(255, 59, 105, 0.1);
  border-radius: 8px;
}

.success-msg {
  color: #34d399;
  font-size: 13px;
  margin-bottom: 8px;
  padding: 8px 12px;
  background: rgba(52, 211, 153, 0.1);
  border-radius: 8px;
}

.auth-footer {
  margin-top: 16px;
  font-size: 11px;
  color: #9ca3af;
}
</style>
