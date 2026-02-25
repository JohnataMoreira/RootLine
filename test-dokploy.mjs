process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

async function main() {
    const url = 'https://painel.johnatamoreira.com.br/api/project.all';

    try {
        console.log(`Fetching from ${url}...`);
        const res = await fetch(url, {
            headers: { 'Authorization': 'Bearer antigravity2_kYIQPBqeZYJYHRXMLoHyeBfVuFEVHsuCvQbjRkBfLFBsTlJAcZbHacXDmGigDNlV' }
        });

        if (res.ok) {
            const data = await res.json();

            // Find application named something like RootLine or Staging
            for (const project of data.data) {
                console.log(`\nProject: ${project.name} (ID: ${project.projectId})`);
                if (project.applications) {
                    for (const app of project.applications) {
                        console.log(`  - App: ${app.name} (ID: ${app.applicationId}) (Type: ${app.appName})`);
                        if (app.name.toLowerCase().includes('rootline')) {
                            console.log(`    -> FOUND MATCH! App ID: ${app.applicationId}`);
                        }
                    }
                }
            }

        } else {
            console.log('FAILED on', url, res.status, await res.text());
        }
    } catch (e) {
        console.log('ERROR on', url, e.message);
    }
}
main();
