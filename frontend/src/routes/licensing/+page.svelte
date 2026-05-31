<script lang="ts">
  import FooterWrappedPage from '$lib/components/ui/FooterWrappedPage.svelte'

  interface LicenseInfo {
    projectName: string
    licenseName: string
    licenseUrl: string
    licenseText: string
  }

  const projectLicenses: LicenseInfo[] = [
    {
      projectName: 'This project',
      licenseName: 'BSD-3-Clause',
      licenseUrl: 'https://github.com/YH-Choi-001/soccer-bt-remote/blob/main/LICENSE.txt',
      licenseText: `BSD 3-Clause License

Copyright (c) 2026, YH Choi
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

1. Redistributions of source code must retain the above copyright notice, this
   list of conditions and the following disclaimer.

2. Redistributions in binary form must reproduce the above copyright notice,
   this list of conditions and the following disclaimer in the documentation
   and/or other materials provided with the distribution.

3. Neither the name of the copyright holder nor the names of its
   contributors may be used to endorse or promote products derived from
   this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
`,
    },
    {
      projectName: 'Svelte',
      licenseName: 'MIT',
      licenseUrl: 'https://github.com/sveltejs/svelte/blob/main/LICENSE.md',
      licenseText: `Copyright (c) 2016-2025 [Svelte Contributors](https://github.com/sveltejs/svelte/graphs/contributors)

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
`,
    },
    {
      projectName: 'Tailwind',
      licenseName: 'MIT',
      licenseUrl: 'https://github.com/tailwindlabs/tailwindcss/blob/main/LICENSE',
      licenseText: `MIT License

Copyright (c) Tailwind Labs, Inc.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
`,
    },
    {
      projectName: 'daisyUI',
      licenseName: 'MIT',
      licenseUrl: 'https://github.com/saadeghi/daisyui/blob/master/LICENSE',
      licenseText: `MIT License

Copyright (c) 2020 Pouya Saadeghi

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
`,
    },
  ]
</script>

<FooterWrappedPage>
  <div class="p-4">
    <h1 class="mt-4 mb-6 text-center text-2xl">
      Welcome to<br class="block md:hidden" /> Soccer Bluetooth Remote Controller
    </h1>

    <p class="text-center text-sm">
      This is an Open Source project.<br class="block md:hidden" />
      You can find the source code on
      <a
        class="link link-info link-hover"
        href="https://github.com/YH-Choi-001/soccer-bt-remote"
        target="_blank"
        rel="external noopener noreferrer">GitHub</a
      >.
    </p>

    <div class="mt-10 flex flex-col gap-8 px-4 md:px-10">
      <div class="text-md max-w-xl overflow-x-auto text-start">
        This project is made possible by a combination of Open Source software. You are not allowed
        to use this project unless you agree to all the terms and conditions as set by the following
        licenses.
      </div>

      <span class="border-b border-base-300 pb-2 text-start text-xl font-semibold">Licenses</span>

      {#each projectLicenses as license (license.projectName)}
        <div class="flex flex-col gap-2">
          <p class="text-md text-start font-medium">
            {license.projectName} is licensed under
            <a
              class="link link-info link-hover"
              href={license.licenseUrl}
              target="_blank"
              rel="external noopener noreferrer">{license.licenseName}</a
            >.
          </p>
          <pre
            class="max-w-2xl rounded-lg border border-base-300 bg-base-200 p-4 text-start font-mono text-xs text-wrap">
{license.licenseText}
          </pre>
        </div>
      {/each}
    </div>
  </div>
</FooterWrappedPage>
