import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/views/Home.vue'
import Login from '@/views/Login.vue'
import Register from '@/views/Register.vue'
import JobList from '@/views/JobList.vue'
import CommonLayout from '@/components/Layout/CommonLayout.vue'
import AdminDashboard from '@/views/admin/Dashboard.vue'
import CompanyReview from '@/views/admin/CompanyReview.vue'
import JobReview from '@/views/admin/JobReview.vue'
import UserReview from '@/views/admin/UserReview.vue'
import AdminProfile from '@/views/admin/Profile.vue'
import AdminRedirect from '@/views/admin/Redirect.vue'
import RecruiterDashboard from '@/views/recruiter/Dashboard.vue'
import ResumeReview from '@/views/recruiter/ResumeReview.vue'
import JobPosting from '@/views/recruiter/JobPosting.vue'
import RecruiterProfile from '@/views/recruiter/Profile.vue'
import BackendRedirect from '@/views/BackendRedirect.vue'
import JobSeekerLayout from '@/components/Layout/JobSeekerLayout.vue'
import JobSeekerProfile from '@/views/jobSeeker/Profile.vue'
import JobSeekerResume from '@/views/jobSeeker/Resume.vue'
import JobSeekerApplicationHistory from '@/views/jobSeeker/ApplicationHistory.vue'
import JobSeekerSavedJobs from '@/views/jobSeeker/SavedJobs.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: Home
    },
    {
      path: '/jobs',
      name: 'JobList',
      component: JobList
    },
    {
      path: '/job/:id',
      name: 'JobDetail',
      component: () => import('@/views/JobDetail.vue'),
      props: true
    },
    {
      path: '/login',
      name: 'Login',
      component: Login
    },
    {
      path: '/register',
      name: 'Register',
      component: Register
    },
    {
      path: '/admin',
      component: CommonLayout,
      children: [
        {
          path: 'dashboard',
          name: 'AdminDashboard',
          component: AdminDashboard
        },
        {
          path: 'company-review',
          name: 'CompanyReview',
          component: CompanyReview
        },
        {
          path: 'job-review',
          name: 'JobReview',
          component: JobReview
        },
        {
          path: 'user-review',
          name: 'UserReview',
          component: UserReview
        },
        {
          path: 'profile',
          name: 'AdminProfile',
          component: AdminProfile
        },
        {
          path: '',
          redirect: '/admin/dashboard'
        }
      ]
    },
    {
      path: '/admin-entry',
      name: 'AdminEntry',
      component: AdminRedirect
    },
    {
      path: '/recruiter',
      component: CommonLayout,
      children: [
        {
          path: 'dashboard',
          name: 'RecruiterDashboard',
          component: RecruiterDashboard
        },
        {
          path: 'job-posting',
          name: 'JobPosting',
          component: JobPosting
        },
        {
          path: 'resume-review',
          name: 'ResumeReview',
          component: ResumeReview
        },
        {
          path: 'profile',
          name: 'RecruiterProfile',
          component: RecruiterProfile
        },
        {
          path: '',
          redirect: '/recruiter/dashboard'
        }
      ]
    },
    {
      path: '/job-seeker',
      component: JobSeekerLayout,
      children: [
        {
          path: 'profile',
          name: 'JobSeekerProfile',
          component: JobSeekerProfile
        },
        {
          path: 'resume',
          name: 'JobSeekerResume',
          component: JobSeekerResume
        },
        {
          path: 'application-history',
          name: 'JobSeekerApplicationHistory',
          component: JobSeekerApplicationHistory
        },
        {
          path: 'saved-jobs',
          name: 'JobSeekerSavedJobs',
          component: JobSeekerSavedJobs
        },
        {
          path: '',
          redirect: '/job-seeker/profile'
        }
      ]
    },
    {
      path: '/backend',
      name: 'Backend',
      component: BackendRedirect
    }
  ],
})

export default router
