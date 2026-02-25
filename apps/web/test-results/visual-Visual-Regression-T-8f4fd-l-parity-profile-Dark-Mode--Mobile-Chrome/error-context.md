# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e2]:
    - banner [ref=e3]:
      - generic [ref=e5]:
        - generic [ref=e6]: person
        - heading "Meu Perfil" [level=1] [ref=e7]
    - main [ref=e8]:
      - generic [ref=e9]:
        - generic [ref=e13]: person
        - heading "test@example.com" [level=2] [ref=e14]
        - generic [ref=e15]: Administrador(a)
        - generic [ref=e16]: test@example.com
      - button "logout Sair da Conta" [ref=e19]:
        - generic [ref=e20]: logout
        - generic [ref=e21]: Sair da Conta
    - navigation [ref=e23]:
      - generic [ref=e24]:
        - link "auto_awesome_motion Memórias" [ref=e25] [cursor=pointer]:
          - /url: /timeline
          - generic [ref=e26]: auto_awesome_motion
          - generic [ref=e27]: Memórias
        - link "account_tree Árvore" [ref=e28] [cursor=pointer]:
          - /url: /tree
          - generic [ref=e29]: account_tree
          - generic [ref=e30]: Árvore
        - link "person Perfil" [ref=e31] [cursor=pointer]:
          - /url: /profile
          - generic [ref=e32]: person
          - generic [ref=e33]: Perfil
  - generic [ref=e34]:
    - img [ref=e36]
    - button "Open Tanstack query devtools" [ref=e84] [cursor=pointer]:
      - img [ref=e85]
  - button "Open Next.js Dev Tools" [ref=e138] [cursor=pointer]:
    - img [ref=e139]
  - alert [ref=e142]
```