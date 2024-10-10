import * as assert from "assert";

type CVInfo = {
    picture: string,
    description?: string,
    relDistance?: number;
    relSize?: number;
}

export type CVItem = {
    picture: string,
    description?: string,
    depth: number
    relDistance: number;
    relSize: number;
}

export type Tree = {
    item: CVItem,
    children: Tree[]
}

const rootItem: CVItem = {picture: "/static/images/Amir.png", depth: 0, relSize: 1, relDistance: 1};
const tree = {item: rootItem, children: []};


function findItem(item: CVInfo): Tree {
    function walkTree(tree: Tree): Tree | undefined {
        if (tree.item === item)
            return tree;
        for (const subTree of tree.children) {
            const res = walkTree(subTree);
            if (res !== undefined)
                return res;
        }
        return undefined;
    }
    return walkTree(tree) ?? assert.fail();
}

function addItem(info: CVInfo, parent: CVInfo): CVInfo {
    const parentTree = findItem(parent);
    const item: CVItem = {
        description: info.description,
        picture: info.picture,
        depth: parentTree.item.depth + 1,
        relDistance: info.relDistance ?? parentTree.item.relDistance * 0.6,
        relSize: info.relSize ?? parentTree.item.relSize * 0.65
    };
    parentTree.children.push({item: item, children: []});
    return item;
}

export function getTree() {
    return tree;
}

// Social Node section
const socialNode = addItem({
    picture: "/static/images/social.jpg"
}, rootItem);

addItem({
    description: "aaa324@sfu.ca",
    picture: "/static/images/email.jpg",
}, socialNode);

addItem({
    description: "<a href=\"https://www.linkedin.com/in/alimohammadi-amirhossein/\">LinkedIn</a>",
    picture: "/static/images/linkedin.jpg",
}, socialNode);

addItem({
    description: "<a href=\"https://github.com/alimohammadiamirhossein\">Github</a>",
    picture: "/static/images/github.jpg",
}, socialNode);


