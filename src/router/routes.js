const routes = [
  {
    path: "/",
    component: () => import("layouts/MainLayout.vue"),
    children: [
      { path: "", component: () => import("pages/PageAuth.vue") },
      { path: "/chat", component: () => import("pages/PageUsers.vue") },
      {
        path: "/chat/:otherUserId",
        component: () => import("pages/PageChat.vue"),
      },
      { path: "/budget", component: () => import("pages/PageBudget.vue") },
      { path: "/diary", component: () => import("pages/PageDiary.vue") },
    ],
  },
  // Always leave this as last one,
  // but you can also remove it
  {
    path: "/:catchAll(.*)*",
    component: () => import("pages/Error404.vue"),
  },
];

export default routes;
