import BLOG from '@/blog.config'
import type { SiteData } from '../site.types'

export function EmptyData(pageId?: string): SiteData {
  return {
    NOTION_CONFIG: {},
    siteInfo: {
      title: 'NotionNext BLOG',
      description: '无法获取 Notion 数据',
      pageCover: 'https://img.ipoodle.top/file/isharehubs/1770190724936_banner.png',
      icon: '/avatar.svg',
      link: BLOG.LINK
    },
    notice: null,
    allPages: [],
    allNavPages: [],
    latestPosts: [],
    categoryOptions: [],
    tagOptions: [],
    customNav: [],
    customMenu: [],
    postCount: 0
  }
}
