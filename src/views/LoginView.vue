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

        <label>
          <span class="label-text">{{ form.entryType === 'admin' ? '운영자 이름 / 닉네임' : '비더라이브 닉네임' }}</span>
          <input v-model="form.nickname" type="text" :placeholder="form.entryType === 'admin' ? '커뮤니티운영팀' : '닉네임'" />
        </label>

        <template v-if="form.entryType === 'admin'">
          <fieldset>
            <legend>권한 구분</legend>
            <div class="role-row">
              <label class="role-option">
                <input v-model="form.adminRole" type="radio" value="admin" />
                <span>운영자</span>
              </label>
              <label class="role-option">
                <input v-model="form.adminRole" type="radio" value="staff" />
                <span>스태프</span>
              </label>
            </div>
          </fieldset>
        </template>

        <template v-else>
          <fieldset>
            <legend>역할 선택</legend>
            <div class="role-row">
              <label class="role-option">
                <input v-model="form.userRole" type="radio" value="buyer" />
                <span>구매자(컬렉터)</span>
              </label>
              <label class="role-option">
                <input v-model="form.userRole" type="radio" value="seller" />
                <span>판매자(딜러)</span>
              </label>
            </div>
          </fieldset>
        </template>

        <button type="submit" class="primary-btn full-width">
          {{ form.entryType === 'admin' ? '관리자 페이지 입장' : '커뮤니티 입장' }}
        </button>
      </form>

      <div class="auth-footer">
        <span>일반 사용자는 피드·자랑글을, 운영자는 게시글/신고/유저 관리를 이용할 수 있습니다.</span>
      </div>
    </div>
  </section>
</template>

<script setup>
import { reactive } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const form = reactive({
  entryType: 'user',
  email: 'collector@bidderlive.com',
  password: '1234',
  nickname: '수집광',
  userRole: 'buyer',
  adminRole: 'admin'
})

function onSubmit() {
  const payload = {
    email: form.email,
    nickname: form.nickname || (form.entryType === 'admin' ? '커뮤니티운영팀' : '닉네임'),
    role: form.entryType === 'admin' ? form.adminRole : form.userRole,
    entryType: form.entryType,
    routeRole: form.entryType
  }
  sessionStorage.setItem('bidderlive-auth', JSON.stringify(payload))
  if (form.entryType === 'admin') {
    router.push('/admin')
  } else {
    router.push('/user')
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

.primary-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 16px 32px rgba(255, 59, 105, 0.45);
}

.primary-btn.full-width {
  width: 100%;
  margin-top: 8px;
}

.auth-footer {
  margin-top: 16px;
  font-size: 11px;
  color: #9ca3af;
}
</style>
