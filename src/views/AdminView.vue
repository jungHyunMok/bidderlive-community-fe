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

function handleMessage(e) {
  if (e.data?.type !== 'REQUEST_ADMIN_AUTH' || !iframeRef.value?.contentWindow) return
  const auth = getAuth()
  if (!auth) return
  iframeRef.value.contentWindow.postMessage(
    {
      type: 'ADMIN_AUTH',
      user: {
        nickname: auth.nickname || '관리자',
        role: auth.role || 'admin'
      }
    },
    '*'
  )
}

function onIframeLoad() {
  const iframe = iframeRef.value
  const auth = getAuth()
  if (!iframe?.contentWindow || !auth) return
  iframe.contentWindow.postMessage(
    {
      type: 'ADMIN_AUTH',
      user: {
        nickname: auth.nickname || '관리자',
        role: auth.role || 'admin'
      }
    },
    '*'
  )
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
