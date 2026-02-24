const fs = require('fs');
const https = require('https');
const path = require('path');

const screens = [
    {
        name: 'arvore_70_membros',
        imgUrl: 'https://lh3.googleusercontent.com/aida/AOfcidXoaXxNR0Rut62EcJMn1tZ5MLiGBpLmwJvzxyy13Y7zIwVpkIgctAmfuQolBMoJR5g35l39s1eNLzlA-KBcscBHHT3ZL32RQuxgWzD302jqcJW55kLn3J_4b7mheOqz07WZkhtlevubYR21dLTMUsvyZ1TlGcPR477sENc3MBz6eGJUiBAbv8Q49tzp6hQ8UjlIiz2Tvx6ZUTt1aQscT0s45k2NRXtjSNEhRHKolcgom8Jl5RqsfBI0DfI',
        htmlUrl: 'https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sXzFkNzYxNTc3MjkxMTQyMzdhYThiMjZiOWU5NjY0MWYxEgsSBxCW5_LwpgEYAZIBIwoKcHJvamVjdF9pZBIVQhM2MDc1NjU2MzEyMDkwNjgzMzkz&filename=&opi=89354086'
    },
    {
        name: 'pagamento',
        imgUrl: 'https://lh3.googleusercontent.com/aida/AOfcidVV8tUqt9tRjq06rnl-klL89ebCPXTkSElJOqMZ3gQkitTAkE7ggGxEH2DujfsUGywWkOjIfGArll7XRSv8QMQrZAxR5ffykhG0JCYcrKeXBBj_JEJsr4rmdSYRqzIARddER4nk-9fOxTsRnmKwFe1csAMUvtZ9oEXtJ5AlW1J98p3WO-IrzZ4uTSbDIiLvgP8FijLzzs5nVRZCibYT_Eb_1pvY9_jRf4HYBg7UqFD1oTfOuL9fqlPtjeA',
        htmlUrl: 'https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sX2E2YjdmMWE4N2Q4MDRmZDM4Yzk3OTQ0YjViYWE0Mzk2EgsSBxCW5_LwpgEYAZIBIwoKcHJvamVjdF9pZBIVQhM2MDc1NjU2MzEyMDkwNjgzMzkz&filename=&opi=89354086'
    },
    {
        name: 'identificacao_rostos',
        imgUrl: 'https://lh3.googleusercontent.com/aida/AOfcidXsZ2B37NGpUYCPP40EwlNuMgycvFpSOR844-2K9wPLyX0nrpGimS_YtMWJKYhIcbPc-IAo8sqttgDZ_ITJUbALr8cwUMpFDqW57HbpwVvEOZmCf2GXc0CEx2ZKlLWP5pKbJERQ2if7yeLLLDHuKl4ilcMKr6dlDYmWGA8shezwJt5g3di5XF21kbp2SOXL2LM7WEwmADUX5N6MERCiooKpl7r5k8WgYERB8z7TI9d-s1HGnRaKbOiXiQ',
        htmlUrl: 'https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sXzRmZTRkYzIyMjk3OTRkNDY4NzM1NTkwMzNlOGQwNDgwEgsSBxCW5_LwpgEYAZIBIwoKcHJvamVjdF9pZBIVQhM2MDc1NjU2MzEyMDkwNjgzMzkz&filename=&opi=89354086'
    },
    {
        name: 'timeline',
        imgUrl: 'https://lh3.googleusercontent.com/aida/AOfcidWB2IvQXy9Fz4akdXYthhqmIEz3FQvTKmt1kJkJzzbei9Lskr6eRbNxeMLpXEOsEFVzcullb0qudVAvpKUjZMUZk8wr_YncnIEl17JAWrkHrI6mbDSrrgENL6oN6dYtnsIN0cmrOdG_noAtFReTbvG9sVfK7lFUTNS18YGOpZQ7Y-PoBaw0xPChbDWqtiAmHEnzDwZ1g465cOGLlB4SqmryYSC6rgy1GYm_89rhQePqVx0676leIoq4x6k',
        htmlUrl: 'https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sXzBmM2I2N2ViYTdjMzQ4ODViY2FiYTIwZTYzMjQyYmU0EgsSBxCW5_LwpgEYAZIBIwoKcHJvamVjdF9pZBIVQhM2MDc1NjU2MzEyMDkwNjgzMzkz&filename=&opi=89354086'
    },
    {
        name: 'recordacao_voz',
        imgUrl: 'https://lh3.googleusercontent.com/aida/AOfcidVIsiVCeCygcOkojSmHlHpYks0ewBoUOhui-qXm34NXsG0FfBSUWrJ8biQS2STlwtk8KqJiIwTGJSn_Y5Gkn4kqi9ktB2BDBsTTCTZDWYNfGC65e3EBBrAu2-s60SKWc8zdniIWWv-fMD4s5i-KDpg3rQR6hDeCKSqSTVlg01JpfCyyv9X9o0t5FDmyX4T1r8aeNpqZfor2LH4DuNMSRprZmXzS-MpgJWUrVo3YURvsbPXMVYcA42WngDo',
        htmlUrl: 'https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sXzQ3NzBmNzU2MTc1MjQyY2Y4ZmQzZjI1MTdlYzMwOTU2EgsSBxCW5_LwpgEYAZIBIwoKcHJvamVjdF9pZBIVQhM2MDc1NjU2MzEyMDkwNjgzMzkz&filename=&opi=89354086'
    },
    {
        name: 'busca',
        imgUrl: 'https://lh3.googleusercontent.com/aida/AOfcidUPLoC6sRQeaym6JizdwCmNzcolVVTbXPbQgVsHLMlFOhKurZjLIxBi5EboI8C6i4LBgRM_9cSJ6OFXT6vGruC0-A0vDZqWXO-gggb2i_OmbW07zG0RfnxQkdfq1x09HdbvYdwgtzn4vbU84q2yQM96Vh_rGXbepfvfVElkZIWB4-OTv3FIQqR2UY_d7RSbRcmZfEuxzhY8csgEd3V-Smob6dPxGy_sYdPFvPjrs_bc7aNhiUKfUyCd_6I',
        htmlUrl: 'https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sXzk0Y2U0YzAwYzdhODQyYzE5ZGVkZjdiZjY5ZDhlNzRlEgsSBxCW5_LwpgEYAZIBIwoKcHJvamVjdF9pZBIVQhM2MDc1NjU2MzEyMDkwNjgzMzkz&filename=&opi=89354086'
    },
    {
        name: 'conectar_fotos',
        imgUrl: 'https://lh3.googleusercontent.com/aida/AOfcidUkGULjqxJmjTmu_mvl-DzDtcipRWHyf7pEf8lgIWMnuUUL9k2MTAk6bMT-y65M23sUsTuYnKzx4u6g_RWLRY6HEjbBGEEsgfS1dzwOctRzIVP6jRNFbZeltUDWwHk62IZ0f2p5xAEPP7blli0N161PCOf581Dhn6lZWJRD7eC-DeB4AG-VOOf4tOp2N43Gdti4t0D6Zivjtu_abFZlc1OSA9opKqBDGxe___wzv5BKRbF3oN_dhMSF6xg',
        htmlUrl: 'https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sXzM1ZDUzNDNhMWM1YTRkOTQ4YWU3YzExYmVlNTI3OGIwEgsSBxCW5_LwpgEYAZIBIwoKcHJvamVjdF9pZBIVQhM2MDc1NjU2MzEyMDkwNjgzMzkz&filename=&opi=89354086'
    },
    {
        name: 'config_privacidade',
        imgUrl: 'https://lh3.googleusercontent.com/aida/AOfcidXqPjm-r6L1QAU4VTmqToqT5Kg9-Jl5rN9bpeh7KGFGI9axO7i73_3EEf3-5Ks6aabx2J7r7bvnzm27REUY0hik1cI6tZlGXgHGTuf9mZ_gfI-KiqeA7TtdBRg-qi7IOxqe_lHjnN1NxxEz7WPMMgT5Aig3DryeBpYUmby-nlf8divAv8OyCVRj8HzeNVfnBx2yxwK5JRvjhXLJiUbmcgC9yJH9ial9O0OsjtuqtGaTj7TO4I9tJ23pGg',
        htmlUrl: 'https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sXzg3ZGJjOTBkNDlmYTQ5NGI5NWMyNzRiYjNlNDBhNGM5EgsSBxCW5_LwpgEYAZIBIwoKcHJvamVjdF9pZBIVQhM2MDc1NjU2MzEyMDkwNjgzMzkz&filename=&opi=89354086'
    },
    {
        name: 'onboarding',
        imgUrl: 'https://lh3.googleusercontent.com/aida/AOfcidUD_GSU6BzfCuKmafaKS4HRRX7cMGG6rgOagQ1cE2sFjunZum5mIIzIB4MJ-RocE7K-zJzSHHm1E2zPW7TykwUeWTi6ApkLJi5JqpyvEVQlH1rdyAYKF_hLY_f_f8D7P71UUWEW5bnx4r_bh6mnjPu1t4EBovxSIBfpvWzm1CmEgGx_F2asDFqA4v4uHxui2MqFEXPZcBaajCbFxNIhtkue2GMgsUFPYV7_kEGGrh5C01nLtJm18cPVzqo',
        htmlUrl: 'https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sX2VjYzJkOGNjOGFhOTRiYWQ4YjRlY2EwMjY3OTYwZWU4EgsSBxCW5_LwpgEYAZIBIwoKcHJvamVjdF9pZBIVQhM2MDc1NjU2MzEyMDkwNjgzMzkz&filename=&opi=89354086'
    },
    {
        name: 'carrinho',
        imgUrl: 'https://lh3.googleusercontent.com/aida/AOfcidU3BZeUAA3B6OFnLdwy4vMn4s43rBP2Cco_XriPkYE8MIrclCrBFKu1pxaKemxDC1tDLwzR9tja1Hyw8iGsn475Fa7Y8eP6XO7RCujqJDJdc2NE-p9zk1nVkQWzxBUiFpNkygrNnl5KgH0HY0aB5rpsnQuFj5ojKeo2CaqRWUVkQ0ttmxiNuaXdkvWdCAx438XSjVvabn145ZOcwvHav1Hk0kebgx2xMqQmadFR4Ijr32mooL7tJTN89lc',
        htmlUrl: 'https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sX2MwZDg1NGIzNGFhNzQ0NDJhYjA0ZWQ5MzY0NjIyZDZiEgsSBxCW5_LwpgEYAZIBIwoKcHJvamVjdF9pZBIVQhM2MDc1NjU2MzEyMDkwNjgzMzkz&filename=&opi=89354086'
    },
    {
        name: 'sucesso_pedido',
        imgUrl: 'https://lh3.googleusercontent.com/aida/AOfcidWg9wsMLtPiK4CCWKYVTeX972jY1XH8NQLyNJPjrkSNwMSWb-k73aKaYi9M27BK9ODtDxwoCzq5DSpwgpEW5KqgiTAtR_xVXeElIiIsE_bjXl4omudzh1r8nnOE87zPNfvu8UeJ_j6J9ko6M04wfvUrmaq2swPHGjmlLkVaAtum69RbNDVXIxaNyZexKDJqdOttVibTSFNc0diaGAxrFagJeZy_obqHRTZLfwye3XgsF9IV9MFplrRJXLU',
        htmlUrl: 'https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sXzFhNWJmMWE0YjFiYjRmYmM5ZjJlMGU4ZTY5MjUxNjI2EgsSBxCW5_LwpgEYAZIBIwoKcHJvamVjdF9pZBIVQhM2MDc1NjU2MzEyMDkwNjgzMzkz&filename=&opi=89354086'
    },
    {
        name: 'memorial',
        imgUrl: 'https://lh3.googleusercontent.com/aida/AOfcidVjjRMvYcVdOL0oZWKeV9igKSoBhhUEJxw5vJnPk-FZ4RkCt-XpNAMmYbuO0U-l9Miyt2l6FtfhKRcnJhpA_v9vanz6FiEveIyE2NVn5rBfsTFiTPzi-MEqZv_YL_ffT3DXG18rBLG_McwMQ5vPq0m2HuelzY6dI2DcLfPo8cac6T_Ax7harHlDt3240BwIwh7uNXQ4lLT_TVZyAP3HtLm7HJ31XcCtQ4rTbm6AOF73nHBvKRgx_AHgwLw',
        htmlUrl: 'https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sXzk2OWM4MDU0NmQ5MjRlZTZhYzU1NDJiNWVhNTM3MzE4EgsSBxCW5_LwpgEYAZIBIwoKcHJvamVjdF9pZBIVQhM2MDc1NjU2MzEyMDkwNjgzMzkz&filename=&opi=89354086'
    },
    {
        name: 'arvore',
        imgUrl: 'https://lh3.googleusercontent.com/aida/AOfcidWtCvaz5tvNcNalaa3iVbA-fFBBidWXkgBMYZBSXCHUSjaeClEdaq6VrZOkC7OPAvZ6tUSQNRzRIMVWT7BGPKpaUPhey2JDvq-i4XG8J4vJzTojXpaLB1E9DUu9rmqM571QOmXQqbUvQjmb63kJjpc2fEPT_CZ8-n72hFMemifP387-pODtEr57mtK_imqzRNheluFANnU0re7sJmpaeD1wOyR8_-d2pODZ7NmlnlVKZWT-ZUTGyWe7eA',
        htmlUrl: 'https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sX2U1MWFmZTU2OWVlYjRjYjJhZTBlNDFhN2Y4Mzc4MDc2EgsSBxCW5_LwpgEYAZIBIwoKcHJvamVjdF9pZBIVQhM2MDc1NjU2MzEyMDkwNjgzMzkz&filename=&opi=89354086'
    },
    {
        name: 'perfil',
        imgUrl: 'https://lh3.googleusercontent.com/aida/AOfcidWaaJlS2UURRejmxdVNKRBuqMVZ49Pn6ZhciHKlQ8dzfadhgeavoQ2xZ7hZ2N_wxl4dcznn8Pe8TdrhAul9FbhmDvGWZgUU6d0GKCHJQjU5hx30FSYNB9PoAVN1y3ZXZZCVfIwKnsZS5WdjNQs1BhGQQsbmeRefHV21lElsFbkUuaXGL2kCXxSRt_5pVkY1bAXQTqIWaXeFKuw_8bTF_XaXGes9qRnt4Vswg9Zw2ChjgaRDvOBqNirNVQ',
        htmlUrl: 'https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sX2VkYjA1MTdjYTAzNDQ0YTU4MGYxM2Q4ZDJmNTA3ODFjEgsSBxCW5_LwpgEYAZIBIwoKcHJvamVjdF9pZBIVQhM2MDc1NjU2MzEyMDkwNjgzMzkz&filename=&opi=89354086'
    },
    {
        name: 'loja_impressao',
        imgUrl: 'https://lh3.googleusercontent.com/aida/AOfcidU8gajKGzgJc9y-TYc1osSRJ7QduQEfzcmZCrAOmy_wkdsGpOSNx8iFnnwV906a7xsRufPcfXXliXdju4yCmQAROAxuksU3wUFRJO63xlojx58bJMzi_I7MpgxaufCxdLSlO-jciu2rcCFM_Xoe7pd_iGsh0kfAMTtv_egsgNz3C73V1s7IwAc-Z7EappIxExSqvI_ahfZ7l9mB3t3dYsvCgoaDAazG1BPjuhKHFl2pcS2G-iE0qr0Mewo',
        htmlUrl: 'https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sXzlmODIyYjVlZWZhYjQ4NmI5MDE5NzcxYzUyNjBmOTYzEgsSBxCW5_LwpgEYAZIBIwoKcHJvamVjdF9pZBIVQhM2MDc1NjU2MzEyMDkwNjgzMzkz&filename=&opi=89354086'
    }
];

function download(url, dest) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            if (res.statusCode > 300 && res.statusCode < 400 && res.headers.location) {
                return download(res.headers.location, dest).then(resolve).catch(reject);
            }
            const file = fs.createWriteStream(dest);
            res.pipe(file);
            file.on('finish', () => { file.close(); resolve(); });
        }).on('error', (err) => { fs.unlink(dest, () => { }); reject(err); });
    });
}

(async () => {
    const baseDir = path.join(process.cwd(), 'docs', 'ui', 'stitch', 'export');
    fs.mkdirSync(baseDir, { recursive: true });

    for (const s of screens) {
        console.log(`Downloading ${s.name}...`);
        const dir = path.join(baseDir, s.name);
        fs.mkdirSync(dir, { recursive: true });
        try {
            if (s.imgUrl) await download(s.imgUrl, path.join(dir, 'screen.png'));
            if (s.htmlUrl) await download(s.htmlUrl, path.join(dir, 'structure.html'));
            console.log(`Finished ${s.name}`);
        } catch (e) {
            console.error(`Error downloading ${s.name}:`, e);
        }
    }
})();
