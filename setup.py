from setuptools import setup, find_packages

setup(
    name="ratatouille",
    version="0.1.0",
    packages=find_packages(where="src"),
    package_dir={"": "src"},
    install_requires=[
        "typing;python_version<'3.5'",
    ],
    extras_require={
        "dev": [
            "pytest>=7.0",
            "pytest-cov>=4.0",
        ],
    },
    author="sgoddijn",
    description="A culinary coding adventure",
    long_description=open("README.md").read(),
    long_description_content_type="text/markdown",
    keywords="cooking, recipes, food",
    url="https://github.com/sgoddijn/Ratatouille-Project",
    classifiers=[
        "Development Status :: 3 - Alpha",
        "Intended Audience :: Developers",
        "License :: OSI Approved :: MIT License",
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.8",
        "Programming Language :: Python :: 3.9",
        "Programming Language :: Python :: 3.10",
    ],
    python_requires=">=3.8",
)