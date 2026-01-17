# Documentation

This folder contains all documentation for the n8n Instagram Post Scheduler project.

## 📚 Documentation Files

### 🚀 Quick Start
**[N8N_QUICK_START.md](./N8N_QUICK_START.md)** - Get up and running in under 10 minutes
- Step-by-step setup instructions
- Environment variable configuration
- Workflow import guide
- Testing and verification
- Troubleshooting common issues

### 📖 Complete Guide
**[N8N_WORKFLOW_GUIDE.md](./N8N_WORKFLOW_GUIDE.md)** - Comprehensive workflow documentation
- Workflow architecture overview
- Detailed node configurations
- Instagram Graph API integration
- Error handling strategies
- Best practices and monitoring
- Advanced customization

### 📦 Workflow File
**[n8n-instagram-workflow.json](./n8n-instagram-workflow.json)** - Ready-to-import n8n workflow
- Complete workflow JSON
- Import directly into n8n
- Pre-configured nodes
- Ready for customization

## 🎯 Getting Started

1. **New to this project?** Start with [N8N_QUICK_START.md](./N8N_QUICK_START.md)
2. **Need detailed info?** Check [N8N_WORKFLOW_GUIDE.md](./N8N_WORKFLOW_GUIDE.md)
3. **Ready to import?** Use [n8n-instagram-workflow.json](./n8n-instagram-workflow.json)

## 📋 What You'll Learn

### Quick Start Guide Covers:
- ✅ Environment setup
- ✅ Instagram API credentials
- ✅ API key generation
- ✅ Workflow import
- ✅ Testing procedures
- ✅ Troubleshooting

### Complete Guide Covers:
- 📊 Workflow architecture
- 🔧 Node-by-node configuration
- 🎨 Customization options
- 🚨 Error handling
- 📈 Monitoring and logging
- 🔐 Security best practices

## 🔑 Key Features Documented

### Supported Post Types
- **Single Image** - Post one image to Instagram
- **Multiple Images** - Carousel posts (2-10 images)
- **Single Video** - Video posts (up to 60 seconds)

### Workflow Capabilities
- ⏰ Automatic scheduling (checks every 5 minutes)
- 🔄 Auto-detection of post types
- ✅ Status updates after publishing
- 🎯 ±10 minute time window for flexibility
- 🛡️ Error handling and retry logic
- 📊 Execution logging

## 🛠️ Prerequisites

Before using these guides, you should have:
- [ ] n8n instance (cloud or self-hosted)
- [ ] Instagram Business Account
- [ ] Facebook Page linked to Instagram
- [ ] Facebook App with Instagram API access
- [ ] Your application deployed and running

## 📖 Related Documentation

- [Instagram Graph API Documentation](https://developers.facebook.com/docs/instagram-api)
- [n8n Official Documentation](https://docs.n8n.io)
- [Facebook Graph API Explorer](https://developers.facebook.com/tools/explorer/)

## 🐛 Troubleshooting

Common issues and solutions are documented in:
- [Quick Start Guide - Troubleshooting Section](./N8N_QUICK_START.md#troubleshooting)
- [Complete Guide - Troubleshooting Section](./N8N_WORKFLOW_GUIDE.md#troubleshooting)

## 💡 Tips

1. **Start Simple**: Import the workflow and test with one post first
2. **Use Long-lived Tokens**: Set up never-expiring tokens to avoid manual refresh
3. **Monitor Executions**: Check n8n execution logs regularly
4. **Set Up Alerts**: Configure error notifications (email/Slack)
5. **Test Media URLs**: Ensure all media URLs are publicly accessible via HTTPS

## 🔄 Workflow Updates

The workflow JSON file is version-controlled. When updating:
1. Export from n8n: **Workflow → Export → Download**
2. Replace the JSON file
3. Update documentation if functionality changed
4. Test thoroughly before deploying

## 📞 Support

- 🐛 **Found a bug?** [Create an issue](https://github.com/your-repo/issues)
- 💬 **Need help?** Check [n8n Community](https://community.n8n.io)
- 📧 **Questions?** Contact the maintainers

## 📝 Contributing

To improve documentation:
1. Fork the repository
2. Update the relevant `.md` files
3. Test your changes
4. Submit a pull request

---

**Happy Automating!** 🚀
