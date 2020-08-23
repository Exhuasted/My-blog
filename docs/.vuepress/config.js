module.exports = {
    title: "前端知识体系",
    description: "欢迎访问我的前端知识体系",
    head: [
        ['link', {rel: 'icon', href: '/logo.png'}]
    ],
    themeConfig: {
        repo: "exhuasted/My-blog",
        logo: '/logo.png',
        nav: [
            {
                text: "博客",
                link: "/blog/"
            },
            {
                text: "阅读",
                link: "/book/"
            }
        ],
        sidebar: {
            "/blog/": [
                {
                    title: 'DevOps',
                    collapsable: false,
                    children: [
                        "devops-webpack-step_01",
                        "devops-webpack-step_02",
                        "devops-webpack-step_03"
                    ]
                },
                {
                    title: 'Framework',
                    collapsable: false,
                    sidebarDepth: 2,
                    children: [

                    ]
                },
                {
                    title: 'JavaScript',
                    collapsable: false,
                    sidebarDepth: 2,
                    children: []
                },
                {
                    title: 'CSS',
                    collapsable: false,
                    sidebarDepth: 2,
                    children: []
                },
                {
                    title: '编程基础',
                    collapsable: false,
                    sidebarDepth: 2,
                    children: []
                },
                {
                    title: '网络协议',
                    collapsable: false,
                    sidebarDepth: 2,
                    children: [
                        "osi-http"
                    ]
                },
                {
                    title: '运维相关',
                    collapsable: false,
                    sidebarDepth: 2,
                    children: []
                },
                {
                    title: '其他',
                    collapsable: false,
                    sidebarDepth: 2,
                    children: []
                },
            ]
        },
        lastUpdated: "更新时间",
        docsDir: "docs"
    },
    plugins: [
        [
            "@vuepress/pwa",
            {
                serviceWorker: true,
                updatePopup: true,
            },
        ],
        ["@vuepress/medium-zoom", true],
        ["@vuepress/back-to-top", true],
    ],
};