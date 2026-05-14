<template>
  <div class="admin-view">
    <iframe
      ref="iframeRef"
      src="/admin.html"
      class="admin-iframe"
      title="비더라이브 운영자 콘솔"
      @load="onIframeLoad"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const iframeRef = ref(null)

function getAuth() {
  try {
    const raw = sessionStorage.getItem('bidderlive-auth')
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function sendAuthToIframe() {
  const iframe = iframeRef.value
  const auth = getAuth()
  if (!iframe?.contentWindow || !auth) return
  iframe.contentWindow.postMessage(
    {
      type: 'ADMIN_AUTH',
      user: {
        id: auth.id,
        uid: auth.uid,
        email: auth.email,
        nickname: auth.nickname || '관리자',
        profileImage: auth.profileImage,
        role: auth.role || 'ADMIN',
        entryType: auth.entryType,
      },
      accessToken: auth.accessToken,
      refreshToken: auth.refreshToken,
    },
    '*'
  )
}

function handleMessage(e) {
  if (!e.data) return

  if (e.data.type === 'REQUEST_ADMIN_AUTH') {
    sendAuthToIframe()
  }

  if (e.data.type === 'ADMIN_LOGOUT') {
    sessionStorage.removeItem('bidderlive-auth')
    window.location.href = '/'
  }
}

function onIframeLoad() {
  sendAuthToIframe()
}

onMounted(() => {
  window.addEventListener('message', handleMessage)
})

onUnmounted(() => {
  window.removeEventListener('message', handleMessage)
})
</script>

<style scoped>
.admin-view {
  position: fixed;
  inset: 0;
  display: flex;
  flex-direction: column;
  background: #020308;
}

.admin-iframe {
  flex: 1;
  width: 100%;
  height: 100%;
  border: none;
  display: block;
}
</style>
