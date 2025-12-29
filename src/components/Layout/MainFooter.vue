<template>
  <footer class="main-footer">
    <div class="footer-container">
      <div class="footer-grid">
        <div class="footer-column footer-brand">
          <div class="footer-logo-container">
            <Icon icon="ri:sparkling-2-fill" class="footer-logo-icon" />
            <span class="footer-logo-text">智聘 2025</span>
          </div>
          <p class="footer-description">连接企业与人才，让每一份才华都不被辜负</p>
          <div class="social-icons">
            <Icon icon="ri:wechat-fill" class="social-icon" />
            <Icon icon="ri:weibo-fill" class="social-icon" />
            <Icon icon="ri:github-fill" class="social-icon" />
          </div>
        </div>
        <div class="footer-column">
          <h4>求职者服务</h4>
          <ul class="footer-links">
            <li><a href="#">职位搜索</a></li>
            <li><a href="#">简历管理</a></li>
            <li><a href="#">职场资讯</a></li>
            <li><a href="#">求职攻略</a></li>
          </ul>
        </div>
        <div class="footer-column">
          <h4>企业服务</h4>
          <ul class="footer-links">
            <li><a href="#">发布职位</a></li>
            <li><a href="#">人才搜索</a></li>
            <li><a href="#">企业服务</a></li>
            <li><a href="#">招聘解决方案</a></li>
          </ul>
        </div>
        <div class="footer-column">
          <h4>关于我们</h4>
          <ul class="footer-links">
            <li><a href="#">公司简介</a></li>
            <li><a href="#">联系我们</a></li>
            <li><a href="#">加入我们</a></li>
            <li><a href="#">用户协议</a></li>
          </ul>
        </div>
      </div>
      <div class="footer-bottom">
        <p class="copyright">© 2025 智聘智能科技有限公司 · 粤ICP备12345678号</p>
        <div class="legal-links">
          <a href="#">隐私政策</a>
          <a href="#">服务条款</a>
          <a href="#">帮助中心</a>
        </div>
      </div>
    </div>
  </footer>
</template>

<script>
import { Icon } from '@iconify/vue'

export default {
  name: 'MainFooter',
  components: {
    Icon
  }
}
</script>

<style scoped>
/* 页脚样式 - 白底黑字 */
.main-footer {
  background-color: white;
  color: #262626;
  padding-top: 64px;
  padding-bottom: 32px;
  border-top: 1px solid #F0F0F0;
}

.footer-container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 32px;
}

.footer-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 48px;
  margin-bottom: 48px;
}

@media (min-width: 768px) {
  .footer-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

.footer-column h4 {
  color: #262626;
  font-weight: bold;
  margin-bottom: 24px;
  font-size: 16px;
}

.footer-links {
  list-style: none;
  padding: 0;
  margin: 0;
}

.footer-links li {
  margin-bottom: 16px;
}

.footer-links a {
  color: #595959;
  text-decoration: none;
  transition: color 0.3s;
  font-size: 14px;
}

.footer-links a:hover {
  color: #1890FF;
}

.footer-brand {
  display: flex;
  flex-direction: column;
}

.footer-logo-container {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 24px;
  color: #262626;
}

.footer-logo-icon {
  font-size: 24px;
  color: #1890FF;
}

.footer-logo-text {
  font-size: 18px;
  font-weight: bold;
  letter-spacing: -0.02em;
}

.footer-description {
  font-size: 14px;
  color: #595959;
  line-height: 1.6;
  margin-bottom: 24px;
}

.social-icons {
  display: flex;
  gap: 16px;
}

.social-icon {
  font-size: 24px;
  color: #595959;
  cursor: pointer;
  transition: color 0.3s;
}

.social-icon:hover {
  color: #1890FF;
}

.footer-bottom {
  padding-top: 32px;
  border-top: 1px solid #F0F0F0;
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #8C8C8C;
}

@media (min-width: 768px) {
  .footer-bottom {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
}

.copyright {
  font-size: 14px;
}

.legal-links {
  display: flex;
  gap: 24px;
  margin-top: 16px;
}

@media (min-width: 768px) {
  .legal-links {
    margin-top: 0;
  }
}

.legal-links a {
  color: #8C8C8C;
  text-decoration: none;
  transition: color 0.3s;
  font-size: 14px;
}

.legal-links a:hover {
  color: #1890FF;
}
</style>