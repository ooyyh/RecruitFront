// 简历申请相关接口
import { get, put } from '@/axios/api.js';
import axios from 'axios';

// 获取招聘者收到的简历列表
export function getRecruiterApplications(status) {
  return get('/application/recruiter/list', { status });
}

// 拒绝简历申请
export function rejectApplication(id, feedback) {
  return put(`/application/reject/${id}`, null, { params: { feedback } });
}

// 发送面试邀请
export function sendInterview(id, interviewTime, interviewPlace) {
  // 将参数直接拼接到URL中，避免params参数传递的问题
  const encodedInterviewTime = encodeURIComponent(interviewTime);
  const encodedInterviewPlace = encodeURIComponent(interviewPlace);
  return put(`/application/interview/${id}?interviewTime=${encodedInterviewTime}&interviewPlace=${encodedInterviewPlace}`, null);
}

// 获取求职者的投递记录
export function getSeekerApplications(status) {
  return get('/application/seeker/list', { status });
}

// 获取投递详情（包含职位信息和求职者简历信息）
export function getApplicationDetail(id) {
  return get(`/application/detail/${id}`);
}